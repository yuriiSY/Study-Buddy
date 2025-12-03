import { PrismaClient } from "@prisma/client";
import mammoth from "mammoth";
import path from "path";

const prisma = new PrismaClient();

export const getFilesByModuleId = async (userId, moduleId) => {
  return prisma.file.findMany({
    where: {
      moduleId: moduleId,
      module: {
        OR: [{ ownerId: userId }, { collaborations: { some: { userId } } }],
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getFileById = async (userId, fileId) => {
  return prisma.file.findFirst({
    where: {
      id: fileId,
      module: {
        OR: [{ ownerId: userId }, { collaborations: { some: { userId } } }],
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
    where: {
      OR: [{ ownerId: userId }, { collaborations: { some: { userId } } }],
    },
    select: {
      id: true,
      title: true,
      archived: true,
      coverImage: true,
      isOwner: true,
      createdAt: true,
      _count: {
        select: { files: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getOriginalFileById = async (fileId) => {
  const file = await prisma.file.findUnique({
    where: { id: Number(fileId) },
  });

  if (!file) {
    throw new Error("File not found");
  }

  return file;
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

export const completeModule = async (userId, moduleId) => {
  return prisma.moduleCompletion.upsert({
    where: {
      userId_moduleId: {
        userId: Number(userId),
        moduleId: Number(moduleId),
      },
    },
    update: {},
    create: {
      userId: Number(userId),
      moduleId: Number(moduleId),
    },
  });
};

export const isModuleCompleted = async (userId, moduleId) => {
  return prisma.moduleCompletion.findUnique({
    where: {
      userId_moduleId: {
        userId: Number(userId),
        moduleId: Number(moduleId),
      },
    },
  });
};

export const getUserCompletedModules = async (userId) => {
  return prisma.moduleCompletion.findMany({
    where: { userId: Number(userId) },
    include: { module: true },
  });
};

export const getModuleCompletionStats = async (userId) => {
  userId = Number(userId);

  const totalModules = await prisma.module.count();

  const totalCompleted = await prisma.moduleCompletion.count({
    where: { userId },
  });

  const percentageCompleted =
    totalModules === 0
      ? 0
      : Number(((totalCompleted / totalModules) * 100).toFixed(2));

  return {
    totalModules,
    totalCompleted,
    percentageCompleted,
  };
};
