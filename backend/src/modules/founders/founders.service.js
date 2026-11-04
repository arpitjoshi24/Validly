import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';

export async function createProfile(userId, data) {
  const existing = await prisma.founderProfile.findUnique({ where: { userId } });
  if (existing) throw new ApiError(409, 'Founder profile already exists');
  return prisma.founderProfile.create({ data: { userId, ...data } });
}

export async function getProfile(userId) {
  const profile = await prisma.founderProfile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(404, 'Founder profile not found');
  return profile;
}

export async function updateProfile(userId, data) {
  await getProfile(userId);
  return prisma.founderProfile.update({ where: { userId }, data });
}