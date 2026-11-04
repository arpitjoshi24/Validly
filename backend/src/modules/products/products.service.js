import { randomUUID } from 'node:crypto';
import { prisma } from '../../config/db.js';
import {
  deleteObject,
  getUploadUrl,
  objectExists,
  publicUrl,
  storageConfigured,
} from '../../config/storage.js';
import { ApiError } from '../../utils/ApiError.js';

const MAX_IMAGES = 5;
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const withImages = { images: { orderBy: { position: 'asc' } } };

function requireStorage() {
  if (!storageConfigured) throw new ApiError(503, 'Image storage is not configured');
}

async function getOwned(productId, founderId) {
  const product = await prisma.product.findFirst({
    where: { id: productId, founderId },
    include: { ...withImages, _count: { select: { campaigns: true } } },
  });
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
}

export const createProduct = (founderId, data) =>
  prisma.product.create({
    data: { founderId, ...data },
    include: { ...withImages, _count: { select: { campaigns: true } } },
  });

export async function listProducts(founderId, { page, limit }) {
  const where = { founderId };
  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: { ...withImages, _count: { select: { campaigns: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export const getProduct = getOwned;

export async function updateProduct(productId, founderId, data) {
  await getOwned(productId, founderId);
  return prisma.product.update({
    where: { id: productId },
    data,
    include: { ...withImages, _count: { select: { campaigns: true } } },
  });
}

export async function deleteProduct(productId, founderId) {
  const product = await getOwned(productId, founderId);
  const started = await prisma.campaign.count({
    where: { productId, status: { not: 'DRAFT' } },
  });
  if (started > 0) {
    throw new ApiError(409, 'This product has a live or closed campaign and cannot be deleted');
  }
  await prisma.product.delete({ where: { id: productId } });
  if (storageConfigured) await Promise.all(product.images.map((i) => deleteObject(i.key)));
}

export async function requestUploadUrl(productId, founderId, { contentType, fileSize }) {
  requireStorage();
  const product = await getOwned(productId, founderId);
  if (product.images.length >= MAX_IMAGES) {
    throw new ApiError(400, `A product can have at most ${MAX_IMAGES} images`);
  }
  const key = `products/${productId}/${randomUUID()}.${EXT[contentType]}`;
  const uploadUrl = await getUploadUrl({ key, contentType, size: fileSize });
  return { uploadUrl, key, method: 'PUT', expiresInSeconds: 300, publicUrl: publicUrl(key) };
}

export async function registerImage(productId, founderId, { key }) {
  requireStorage();
  const product = await getOwned(productId, founderId);
  if (!key.startsWith(`products/${productId}/`)) throw new ApiError(400, 'Invalid image key');
  if (product.images.length >= MAX_IMAGES) {
    throw new ApiError(400, `A product can have at most ${MAX_IMAGES} images`);
  }
  if (!(await objectExists(key))) throw new ApiError(400, 'Image has not been uploaded yet');

  return prisma.productImage.create({
    data: { productId, key, url: publicUrl(key), position: product.images.length },
  });
}

export async function deleteImage(productId, imageId, founderId) {
  await getOwned(productId, founderId);
  const image = await prisma.productImage.findFirst({ where: { id: imageId, productId } });
  if (!image) throw new ApiError(404, 'Image not found');
  await prisma.productImage.delete({ where: { id: imageId } });
  if (storageConfigured) await deleteObject(image.key);
}