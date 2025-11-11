import { PrismaClient } from "@prisma/client";
import { convertDocxToHtml } from "../services/uploadService.js";
import * as uploadService from "../services/uploadService.js";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";

const prisma = new PrismaClient();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ----------------------------------------------------------------------
// Upload files (create or update module)
// ----------------------------------------------------------------------
export const uploadFiles = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const { moduleName, moduleId, file_id } = req.body;

  try {
    let module;

    if (moduleId) {
      module = await prisma.module.findFirst({
        where: {
          id: Number(moduleId),
          OR: [
            { ownerId: req.user.id },
            {
              collaborations: { some: { userId: req.user.id, role: "editor" } },
            },
          ],
        },
        include: { files: true },
      });

      if (!module) {
        return res
          .status(403)
          .json({ error: "Not allowed to upload to this module" });
      }
    } else {
      if (!moduleName || !moduleName.trim()) {
        return res.status(400).json({ error: "Module name is required" });
      }

      module = await prisma.module.create({
        data: {
          title: moduleName,
          ownerId: req.user.id,
        },
      });
    }

    const uploadedResults = [];

    for (const file of req.files) {
      const filePath = file.path;
      const fileName = file.originalname;

      const fileBuffer = fs.readFileSync(filePath);
      const s3Key = `modules/${module.id}/${Date.now()}-${fileName}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: s3Key,
          Body: fileBuffer,
          ContentType: file.mimetype,
        })
      );

      const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

      let html = "";
      if (
        file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        html = await convertDocxToHtml(filePath);
      }

      fs.unlink(filePath, () => {});

      const savedFile = await prisma.file.create({
        data: {
          filename: fileName,
          html,
          s3Url,
          s3Key,
          moduleId: module.id,
          externalId: file_id || null,
        },
      });

      uploadedResults.push(savedFile);
    }

    const updatedModule = await prisma.module.findUnique({
      where: { id: module.id },
      include: { files: true },
    });

    res.json({
      message: moduleId
        ? "Files added to existing module successfully"
        : "Module created and files uploaded successfully",
      module: updatedModule,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

// ----------------------------------------------------------------------
// Get signed S3 URL for download
// ----------------------------------------------------------------------
export const getFileUrl = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await uploadService.getOriginalFileById(fileId);

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.s3Key,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    res.json({
      id: file.id,
      filename: file.filename,
      url: signedUrl,
      expiresIn: "5 minutes",
    });
  } catch (err) {
    console.error("❌ Error generating file URL:", err);
    res
      .status(err.message === "File not found" ? 404 : 500)
      .json({ error: err.message });
  }
};

// ----------------------------------------------------------------------
// Fetch modules and files
// ----------------------------------------------------------------------
export const getUserModules = async (req, res) => {
  try {
    const userId = req.user.id;
    const modules = await uploadService.getModulesByUserId(userId);
    res.json({ modules });
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({ error: "Failed to fetch modules" });
  }
};

export const getFilesByModule = async (req, res) => {
  try {
    const userId = req.user.id;
    const moduleId = parseInt(req.params.moduleId);
    const files = await uploadService.getFilesByModuleId(userId, moduleId);
    res.json({ files });
  } catch (error) {
    console.error("Error fetching files by module:", error);
    res.status(500).json({ error: "Failed to fetch files for this module" });
  }
};

export const getFileHtml = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const file = await uploadService.getFileById(userId, parseInt(id));

    if (!file) return res.status(404).json({ error: "File not found" });
    res.json({ html: file.html });
  } catch (error) {
    console.error("Error fetching file HTML:", error);
    res.status(500).json({ error: "Failed to fetch file HTML" });
  }
};

// ----------------------------------------------------------------------
// Delete, update, archive, unarchive modules
// ----------------------------------------------------------------------
export const deleteModule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;

    const module = await prisma.module.findUnique({
      where: { id: Number(moduleId) },
      include: { files: true },
    });

    if (!module || module.ownerId !== userId) {
      return res.status(404).json({ error: "Module not found" });
    }

    for (const file of module.files) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: file.s3Key,
          })
        );
      } catch (err) {
        console.warn("Failed to delete file from S3:", file.s3Key);
      }
    }

    await prisma.file.deleteMany({ where: { moduleId: module.id } });
    await prisma.module.delete({ where: { id: module.id } });

    res.json({ message: "Module and its files deleted successfully" });
  } catch (error) {
    console.error("Error deleting module:", error);
    res.status(500).json({ error: "Failed to delete module" });
  }
};

export const updateModuleTitle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const module = await prisma.module.findUnique({
      where: { id: Number(moduleId) },
    });

    if (!module || module.ownerId !== userId) {
      return res.status(404).json({ error: "Module not found" });
    }

    const updatedModule = await prisma.module.update({
      where: { id: module.id },
      data: { title },
    });

    res.json({
      message: "Module title updated successfully",
      module: updatedModule,
    });
  } catch (error) {
    console.error("Error updating module title:", error);
    res.status(500).json({ error: "Failed to update module title" });
  }
};

export const archiveModule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;

    const module = await prisma.module.findUnique({
      where: { id: Number(moduleId) },
    });

    if (!module || module.ownerId !== userId) {
      return res.status(404).json({ error: "Module not found" });
    }

    const updatedModule = await prisma.module.update({
      where: { id: module.id },
      data: { archived: true },
    });

    res.json({
      message: "Module archived successfully",
      module: updatedModule,
    });
  } catch (error) {
    console.error("Error archiving module:", error);
    res.status(500).json({ error: "Failed to archive module" });
  }
};

export const unarchiveModule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;

    const module = await prisma.module.findUnique({
      where: { id: Number(moduleId) },
    });

    if (!module || module.ownerId !== userId) {
      return res.status(404).json({ error: "Module not found" });
    }

    const updatedModule = await prisma.module.update({
      where: { id: module.id },
      data: { archived: false },
    });

    res.json({
      message: "Module restored from archive",
      module: updatedModule,
    });
  } catch (error) {
    console.error("Error unarchiving module:", error);
    res.status(500).json({ error: "Failed to unarchive module" });
  }
};

// ----------------------------------------------------------------------
// Collaborator Management
// ----------------------------------------------------------------------
export const addCollaborator = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { moduleId } = req.params;
    const { collaboratorEmail, role } = req.body;

    const module = await prisma.module.findUnique({
      where: { id: Number(moduleId) },
    });

    if (!module || module.ownerId !== ownerId)
      return res
        .status(403)
        .json({ error: "You are not allowed to share this module" });

    const user = await prisma.user.findUnique({
      where: { email: collaboratorEmail },
    });
    if (!user) return res.status(404).json({ error: "Collaborator not found" });

    const collaboration = await prisma.collaboration.upsert({
      where: { userId_moduleId: { userId: user.id, moduleId: module.id } },
      update: { role: role || "editor" },
      create: { userId: user.id, moduleId: module.id, role: role || "editor" },
    });

    res.json({ message: "Collaborator added successfully", collaboration });
  } catch (error) {
    res.status(500).json({ error: "Failed to add collaborator" });
  }
};

export const removeCollaborator = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { moduleId, collaboratorId } = req.params;

    const module = await prisma.module.findUnique({
      where: { id: Number(moduleId) },
    });

    if (!module || module.ownerId !== ownerId)
      return res
        .status(403)
        .json({ error: "You are not allowed to modify this module" });

    await prisma.collaboration.deleteMany({
      where: { moduleId: Number(moduleId), userId: Number(collaboratorId) },
    });

    res.json({ message: "Collaborator removed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove collaborator" });
  }
};

export const getCollaborators = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const collaborators = await prisma.collaboration.findMany({
      where: { moduleId: Number(moduleId) },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json({ collaborators });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch collaborators" });
  }
};
