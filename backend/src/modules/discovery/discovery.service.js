import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/ApiError.js';
import { CATEGORIES } from '../../utils/categories.js';

const publicSelect = {
  id: true,
  publishedAt: true,
  endsAt: true,
  location: true,
  targetAudience: true,
  objective: true,
  product: {
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      images: { orderBy: { position: 'asc' }, select: { id: true, url: true, position: true } },
      founder: {
        select: { founderProfile: { select: { businessName: true, verificationStatus: true } } },
      },
    },
  },
  variants: {
    orderBy: { position: 'asc' },
    select: { id: true, name: true, description: true, pricePaise: true },
  },
};

const liveWhere = () => ({ status: 'ACTIVE', endsAt: { gt: new Date() } });

export async function listLive({ category, search, sort, page, limit }) {
  const where = {
    ...liveWhere(),
    ...((category || search) && {
      product: {
        ...(category && { category }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
    }),
  };

  const orderBy = sort === 'ending_soon' ? { endsAt: 'asc' } : { publishedAt: 'desc' };

  const [items, total] = await prisma.$transaction([
    prisma.campaign.findMany({
      where,
      select: publicSelect,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.campaign.count({ where }),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getLive(campaignId) {
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ...liveWhere() },
    select: publicSelect,
  });
  if (!campaign) throw new ApiError(404, 'Campaign not found or no longer live');
  return campaign;
}

export const listCategories = () => CATEGORIES;