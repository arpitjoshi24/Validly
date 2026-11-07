export type CampaignStatus = "DRAFT" | "ACTIVE" | "CLOSED";

export type Variant = {
  id: string;
  name: string;
  description: string | null;
  price: number; // rupees
  pricePaise: number;
};

export type ProductImage = { id: string; url: string; position: number };

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  images: ProductImage[];
  campaignCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type Campaign = {
  id: string;
  status: CampaignStatus;
  isLive: boolean;
  objective: string | null;
  targetAudience: string | null;
  location: string | null;
  durationDays: number;
  publishedAt: string | null;
  endsAt: string | null;
  closedAt: string | null;
  createdAt: string;
  product?: Product;
  variants: Variant[];
};

export type Pagination = { page: number; limit: number; total: number; totalPages: number };

export type VariantInput = { name: string; description?: string; price: number };

export type CampaignPayload = {
  productId?: string; // create only
  objective?: string;
  targetAudience?: string;
  location?: string;
  durationDays: number;
  variants: VariantInput[];
};