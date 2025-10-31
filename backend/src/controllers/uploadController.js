import { PrismaClient } from "@prisma/client";
import { convertDocxToHtml } from "../services/uploadService.js";
import * as uploadService from "../services/uploadService.js";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
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

export const uploadFiles = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const { moduleName, moduleId } = req.body;

  try {
    let module;

    if (moduleId) {
      module = await prisma.module.findUnique({
        where: { id: Number(moduleId) },
        include: { files: true },
      });

      if (!module) {
        return res.status(404).json({ error: "Module not found" });
      }
    } else {
      if (!moduleName || !moduleName.trim()) {
        return res.status(400).json({ error: "Module name is required" });
      }

      module = await prisma.module.create({
        data: {
          title: moduleName,
          userId: req.user.id,
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

export const getFileUrl = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await uploadService.getOriginalFileById(fileId);

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.s3Key,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min

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

export const getUserFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = await uploadService.getFilesByUserId(userId);
    res.json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

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

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json({ html: file.html });
  } catch (error) {
    console.error("Error fetching file HTML:", error);
    res.status(500).json({ error: "Failed to fetch file HTML" });
  }
};
