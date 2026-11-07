/* eslint-disable @typescript-eslint/no-explicit-any */
import { api,pick } from "@/lib/api";
import type { Campaign, Pagination, Sort } from "./discovery.types";

// Where the discovery router is mounted in the backend's app.js
const BASE = "/discover";

export interface DiscoverFilters {
  category?: string;
  search?: string;
  sort?: Sort;
  page?: number;
  limit?: number;
}

function toQuery(filters: DiscoverFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Accepts the nested Prisma shape or a flattened DTO, and returns one predictable shape. */
export function normalizeCampaign(raw: any): Campaign {
  const product = raw.product ?? {};
  const profile = product.founder?.founderProfile ?? raw.founder?.founderProfile ?? raw.business ?? null;
  const images: any[] = product.images ?? raw.images ?? [];

  return {
    id: raw.id,
    endsAt: raw.endsAt,
    publishedAt: raw.publishedAt ?? null,
    location: raw.location ?? null,
    targetAudience: raw.targetAudience ?? null,
    objective: raw.objective ?? null,
    product: {
      id: product.id ?? raw.productId ?? "",
      name: product.name ?? raw.name ?? "Untitled product",
      description: product.description ?? raw.description ?? "",
      category: product.category ?? raw.category ?? "OTHER",
      images: images.map((img) => ({ id: img.id, url: img.url })),
    },
    business: profile
      ? {
          name: profile.businessName ?? profile.name ?? "",
          verified: (profile.verificationStatus ?? (profile.verified ? "VERIFIED" : "")) === "VERIFIED",
        }
      : null,
    variants: (raw.variants ?? []).map((v: any) => ({
      id: v.id,
      name: v.name,
      description: v.description ?? null,
      pricePaise: v.pricePaise,
    })),
  };
}

export const discoveryApi = {
  list: async (filters: DiscoverFilters = {}) => {
    const data = await api.get<{ items?: unknown[]; pagination?: Pagination }>(`${BASE}${toQuery(filters)}`);
    return {
      items: (data.items ?? []).map(normalizeCampaign),
      pagination: data.pagination ?? null,
    };
  },

  categories: async () => pick<string[]>(await api.get<unknown>(`${BASE}/categories`), "categories"),

  getOne: async (campaignId: string) =>
    normalizeCampaign(pick<unknown>(await api.get<unknown>(`${BASE}/${campaignId}`), "campaign")),
};