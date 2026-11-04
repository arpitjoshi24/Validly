export const toPaise = (rupees) => Math.round(rupees * 100);

export const toVariantDto = (v) => ({
  id: v.id,
  name: v.name,
  description: v.description,
  price: v.pricePaise / 100,
  pricePaise: v.pricePaise,
});

export const toImageDto = (i) => ({ id: i.id, url: i.url, position: i.position });

export const toProductDto = (p) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  category: p.category,
  images: (p.images ?? []).map(toImageDto),
  campaignCount: p._count?.campaigns,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

export const toCampaignDto = (c) => ({
  id: c.id,
  status: c.status,
  isLive: c.status === 'ACTIVE' && !!c.endsAt && c.endsAt > new Date(),
  objective: c.objective,
  targetAudience: c.targetAudience,
  location: c.location,
  durationDays: c.durationDays,
  publishedAt: c.publishedAt,
  endsAt: c.endsAt,
  closedAt: c.closedAt,
  createdAt: c.createdAt,
  product: c.product ? toProductDto(c.product) : undefined,
  variants: (c.variants ?? []).map(toVariantDto),
});

export const toPublicCampaignDto = (c) => ({
  id: c.id,
  publishedAt: c.publishedAt,
  endsAt: c.endsAt,
  location: c.location,
  targetAudience: c.targetAudience,
  objective: c.objective,
  product: {
    id: c.product.id,
    name: c.product.name,
    description: c.product.description,
    category: c.product.category,
    images: c.product.images,
    brand: {
      name: c.product.founder.founderProfile?.businessName ?? null,
      verified: c.product.founder.founderProfile?.verificationStatus === 'VERIFIED',
    },
  },
  variants: c.variants.map(toVariantDto),
});