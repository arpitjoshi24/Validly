import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/db.js';

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);

await prisma.user.upsert({
  where: { email },
  update: {},
  create: { name: 'Platform Admin', email, passwordHash, role: 'ADMIN' },
});

console.log(`Admin ready: ${email}`);
await prisma.$disconnect();