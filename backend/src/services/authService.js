import prisma from "../config/prisma.js";

export const signup = (data) => prisma.user.create({ data });

export const findUserByEmail = (email) =>
  prisma.user.findUnique({ where: { email } });

export async function findUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

export const updateUserProfile = (userId, data) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      specialization: true,
    },
  });
};
