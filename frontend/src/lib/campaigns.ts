import { api, pick } from "@/lib/api";
import type { Campaign, CampaignPayload, CampaignStatus, Pagination, Product } from "@/types/campaign";

type ListParams = { status?: CampaignStatus; page?: number; limit?: number };

export type WaitlistResponse = {
  total: number;
  consented: number;
  entries: { name: string; email: string; joinedAt: string }[];
  pagination: Pagination;
};

export type CampaignResults = {
  totals: { votes: number; likes: number; comments: number; views: number; waitlist: number };
  variants: {
    id: string;
    name: string;
    price: number;
    votes: number;
    votePercent: number;
    intents: { DEFINITELY: number; PROBABLY: number; MAYBE: number; NO: number };
  }[];
  comments: { id: string; content: string; createdAt: string; userName: string }[];
};

export const campaignsApi = {
  list(params: ListParams = {}) {
    const qs = new URLSearchParams();
    if (params.status) qs.set("status", params.status);
    qs.set("page", String(params.page ?? 1));
    qs.set("limit", String(params.limit ?? 10));
    return api.get<{ items: Campaign[]; pagination: Pagination }>(`/campaigns?${qs}`);
  },
  async get(id: string) {
    return pick<Campaign>(await api.get<unknown>(`/campaigns/${id}`), "campaign");
  },
  async create(body: CampaignPayload) {
    return pick<Campaign>(await api.post<unknown>("/campaigns", body), "campaign");
  },
  async update(id: string, body: Omit<CampaignPayload, "productId">) {
    return pick<Campaign>(await api.patch<unknown>(`/campaigns/${id}`, body), "campaign");
  },
  async publish(id: string) {
    return pick<Campaign>(await api.patch<unknown>(`/campaigns/${id}/publish`), "campaign");
  },
  async close(id: string) {
    return pick<Campaign>(await api.patch<unknown>(`/campaigns/${id}/close`), "campaign");
  },
  remove(id: string) {
    return api.delete<unknown>(`/campaigns/${id}`);
  },
  waitlist(id: string, page = 1) {
    return api.get<WaitlistResponse>(`/campaigns/${id}/waitlist?page=${page}&limit=50`);
  },
  results(id: string) {
    return api.get<CampaignResults>(`/campaigns/${id}/results`);
  },
};

export const listMyProducts = () =>
  api.get<{ items: Product[]; pagination: Pagination }>("/products?limit=50");

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

export const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export function timeLeft(endsAt: string | null) {
  if (!endsAt) return null;
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return "Ended";
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
}