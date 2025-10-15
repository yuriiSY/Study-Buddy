import { PrismaClient } from "@prisma/client";
import { convertDocxToHtml } from "../services/uploadService.js";
import * as uploadService from "../services/uploadService.js";
import fs from "fs";

const prisma = new PrismaClient();

export const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const filePath = req.file.path;
  const fileName = req.file.originalname;

  try {
    const html = await convertDocxToHtml(filePath);

    fs.unlink(filePath, () => {});

    const savedFile = await prisma.file.create({
      data: {
        filename: fileName,
        html,
        userId: req.user.id,
      },
    });

    res.json({
      message: "File uploaded and saved successfully",
      file: savedFile,
    });
  } catch (err) {
    fs.unlink(filePath, () => {});
    console.error("Conversion failed:", err);
    res.status(500).json({ error: "Conversion failed" });
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
