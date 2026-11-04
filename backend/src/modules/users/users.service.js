import bcrypt from 'bcryptjs';
import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { safeUserSelect } from '../auth/auth.service.js';

export async function updateMe(userId, { name, currentPassword, newPassword }) {
  const data = {};
  if (name) data.name = name;

  if (newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw new ApiError(401, 'Current password is incorrect');
    data.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  return prisma.user.update({ where: { id: userId }, data, select: safeUserSelect });
}