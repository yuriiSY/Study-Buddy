import { PrismaClient } from "@prisma/client";
import mammoth from "mammoth";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

export const getFilesByUserId = async (userId) => {
  return prisma.file.findMany({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
  });
};

export const getFileById = async (userId, fileId) => {
  return prisma.file.findFirst({
    where: { id: fileId, userId },
  });
};

export const convertDocxToHtml = async (filePath) => {
  const resolvedPath = path.resolve(filePath);

  const result = await mammoth.convertToHtml(
    { path: resolvedPath },
    {
      styleMap: [
        "p => p:fresh",
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Normal'] => p.fancy-text",
        "r[style-name='Bold'] => strong",
      ],
      convertImage: mammoth.images.inline((image) => {
        return image.read("base64").then((imageBuffer) => {
          return {
            src: `data:${image.contentType};base64,${imageBuffer}`,
            alt: image.altText || "",
            style: "max-width:100%; height:auto;",
            class: "image-responsive",
          };
        });
      }),
    }
  );

  return result.value;
};
