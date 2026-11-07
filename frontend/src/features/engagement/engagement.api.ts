import { api, pick } from "@/lib/api";
import type { Comment, CommentPage, IntentLevel, MyEngagement } from "./engagement.types";

// CHECK THIS: use the same path your backend mounts the engagement router on,
// e.g. app.use("/api/engagement", engagementRoutes)  ->  "/engagement"
const BASE = "/discover";

export const engagementApi = {
  me: (campaignId: string) => api.get<MyEngagement>(`${BASE}/${campaignId}/me`),

  vote: (campaignId: string, variantId: string) =>
    api.put<{ votedVariantId: string }>(`${BASE}/${campaignId}/vote`, { variantId }),
  removeVote: (campaignId: string) => api.delete<unknown>(`${BASE}/${campaignId}/vote`),

  setIntent: (campaignId: string, variantId: string, level: IntentLevel) =>
    api.put<unknown>(`${BASE}/${campaignId}/intent`, { variantId, level }),

  like: (campaignId: string) => api.post<unknown>(`${BASE}/${campaignId}/like`),
  unlike: (campaignId: string) => api.delete<unknown>(`${BASE}/${campaignId}/like`),

  listComments: (campaignId: string, page = 1, limit = 10) =>
    api.get<CommentPage>(`${BASE}/${campaignId}/comments?page=${page}&limit=${limit}`),
  async createComment(campaignId: string, content: string) {
    return pick<Comment>(await api.post<unknown>(`${BASE}/${campaignId}/comments`, { content }), "comment");
  },
  deleteComment: (campaignId: string, commentId: string) =>
    api.delete<unknown>(`${BASE}/${campaignId}/comments/${commentId}`),

  joinWaitlist: (campaignId: string, consentToShareEmail: boolean) =>
    api.post<{ onWaitlist: boolean; waitlistConsent: boolean }>(`${BASE}/${campaignId}/waitlist`, {
      consentToShareEmail,
    }),
  leaveWaitlist: (campaignId: string) => api.delete<unknown>(`${BASE}/${campaignId}/waitlist`),
};