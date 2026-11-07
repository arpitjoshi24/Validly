import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { safeUserSelect } from '../auth/auth.service.js';

export async function listUsers({ role, status, search, page, limit }) {
  const where = {};
  if (role) where.role = role;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        ...safeUserSelect,
        founderProfile: { select: { businessName: true, verificationStatus: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function setFounderVerification(userId, status) {
  const profile = await prisma.founderProfile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(404, 'Founder profile not found');
  return prisma.founderProfile.update({
    where: { userId },
    data: { verificationStatus: status },
  });
}

export async function setUserStatus(adminId, userId, status) {
  if (adminId === userId) throw new ApiError(400, 'You cannot change your own status');
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, 'User not found');
  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: safeUserSelect,
  });
}

export async function setCommentStatus(commentId, status) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new ApiError(404, 'Comment not found');
  return prisma.comment.update({
    where: { id: commentId },
    data: { status },
    select: { id: true, status: true },
  });
}