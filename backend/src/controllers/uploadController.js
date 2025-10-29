import { PrismaClient } from "@prisma/client";
import { convertDocxToHtml } from "../services/uploadService.js";
import * as uploadService from "../services/uploadService.js";
import fs from "fs";

const prisma = new PrismaClient();

export const uploadFiles = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const { moduleName } = req.body;
  if (!moduleName || !moduleName.trim()) {
    return res.status(400).json({ error: "Module name is required" });
  }

  try {
    const module = await prisma.module.create({
      data: {
        title: moduleName,
        userId: req.user.id,
      },
    });

    const uploadedResults = [];

    for (const file of req.files) {
      const filePath = file.path;
      const fileName = file.originalname;

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
          moduleId: module.id,
        },
      });

      uploadedResults.push(savedFile);
    }

    res.json({
      message: "Module created and files uploaded successfully",
      module: {
        ...module,
        files: uploadedResults,
      },
    });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
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
