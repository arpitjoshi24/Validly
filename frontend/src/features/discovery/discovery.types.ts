export interface CampaignVariant {
  id: string;
  name: string;
  description: string | null;
  pricePaise: number;
}

export interface Campaign {
  id: string;
  endsAt: string;
  publishedAt: string | null;
  location: string | null;
  targetAudience: string | null;
  objective: string | null;
  product: {
    id: string;
    name: string;
    description: string;
    category: string;
    images: { id: string; url: string }[];
  };
  business: { name: string; verified: boolean } | null;
  variants: CampaignVariant[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type Sort = "recent" | "ending_soon";