import { prisma } from '../../config/db.js';
import { storageConfigured } from '../../config/storage.js';
import { ApiError } from '../../utils/ApiError.js';
import { toPaise } from '../../utils/serializers.js';

const include = {
  product: { include: { images: { orderBy: { position: 'asc' } } } },
  variants: { orderBy: { position: 'asc' } },
};

const variantRows = (campaignId, variants) =>
  variants.map((v, i) => ({
    campaignId,
    name: v.name,
    description: v.description,
    pricePaise: toPaise(v.price),
    position: i,
  }));

async function getOwned(campaignId, founderId) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, product: { founderId } },
    include,
  });
  if (!campaign) throw new ApiError(404, 'Campaign not found');
  return campaign;
}

export const getCampaign = getOwned;

export async function createCampaign(founderId, { productId, variants, ...fields }) {
  const product = await prisma.product.findFirst({ where: { id: productId, founderId } });
  if (!product) throw new ApiError(404, 'Product not found');

  return prisma.campaign.create({
    data: {
      productId,
      ...fields,
      variants: {
        create: variants.map((v, i) => ({
          name: v.name,
          description: v.description,
          pricePaise: toPaise(v.price),
          position: i,
        })),
      },
    },
    include,
  });
}

export async function listCampaigns(founderId, { status, page, limit }) {
  const where = { product: { founderId }, ...(status && { status }) };
  const [items, total] = await prisma.$transaction([
    prisma.campaign.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.campaign.count({ where }),
  ]);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function updateCampaign(campaignId, founderId, { variants, ...fields }) {
  const campaign = await getOwned(campaignId, founderId);
  if (campaign.status !== 'DRAFT') {
    throw new ApiError(409, 'Only draft campaigns can be edited');
  }

  await prisma.$transaction(async (tx) => {
    if (Object.keys(fields).length > 0) {
      await tx.campaign.update({ where: { id: campaignId }, data: fields });
    }
    if (variants) {
      await tx.campaignVariant.deleteMany({ where: { campaignId } });
      await tx.campaignVariant.createMany({ data: variantRows(campaignId, variants) });
    }
  });

  return getOwned(campaignId, founderId);
}

export async function publishCampaign(campaignId, founderId) {
  const campaign = await getOwned(campaignId, founderId);
  if (campaign.status !== 'DRAFT') throw new ApiError(409, 'Only draft campaigns can be published');

  const profile = await prisma.founderProfile.findUnique({ where: { userId: founderId } });
  if (!profile || profile.verificationStatus !== 'VERIFIED') {
    throw new ApiError(403, 'Your founder account must be verified by an admin before publishing');
  }
  if (campaign.variants.length === 0) {
    throw new ApiError(400, 'Add at least one variant before publishing');
  }
  if (storageConfigured && campaign.product.images.length === 0) {
    throw new ApiError(400, 'Add at least one product image before publishing');
  }

  const now = new Date();
  const endsAt = new Date(now.getTime() + campaign.durationDays * 24 * 60 * 60 * 1000);

  // updateMany with a status condition stops double-publishing from concurrent requests.
  const result = await prisma.campaign.updateMany({
    where: { id: campaignId, status: 'DRAFT' },
    data: { status: 'ACTIVE', publishedAt: now, endsAt },
  });
  if (result.count === 0) throw new ApiError(409, 'Campaign was already published');

  return getOwned(campaignId, founderId);
}

export async function closeCampaign(campaignId, founderId) {
  await getOwned(campaignId, founderId);
  const result = await prisma.campaign.updateMany({
    where: { id: campaignId, status: 'ACTIVE' },
    data: { status: 'CLOSED', closedAt: new Date() },
  });
  if (result.count === 0) throw new ApiError(409, 'Only active campaigns can be closed');
  return getOwned(campaignId, founderId);
}

export async function deleteCampaign(campaignId, founderId) {
  const campaign = await getOwned(campaignId, founderId);
  if (campaign.status !== 'DRAFT') {
    throw new ApiError(409, 'Only draft campaigns can be deleted');
  }
  await prisma.campaign.delete({ where: { id: campaignId } });
}