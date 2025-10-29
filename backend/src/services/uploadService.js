import { PrismaClient } from "@prisma/client";
import mammoth from "mammoth";
import path from "path";

const prisma = new PrismaClient();

export const getFilesByModuleId = async (userId, moduleId) => {
  return prisma.file.findMany({
    where: {
      moduleId: moduleId,
      module: {
        userId: userId,
      },
    },
    orderBy: { uploadedAt: "desc" },
  });
};

export const getFileById = async (userId, fileId) => {
  return prisma.file.findFirst({
    where: {
      id: fileId,
      module: {
        userId: userId,
      },
    },
    include: {
      module: {
        select: { id: true, title: true },
      },
    },
  });
};

export const getModulesByUserId = async (userId) => {
  return prisma.module.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      createdAt: true,
      _count: {
        select: { files: true },
      },
    },
    orderBy: { createdAt: "desc" },
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
        return image.read("base64").then((imageBuffer) => ({
          src: `data:${image.contentType};base64,${imageBuffer}`,
          alt: image.altText || "",
          style: "max-width:100%; height:auto;",
          class: "image-responsive",
        }));
      }),
    }
  );

  return result.value;
};
