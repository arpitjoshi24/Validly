export type IntentLevel = "DEFINITELY" | "PROBABLY" | "MAYBE" | "NO";

export type MyEngagement = {
  votedVariantId: string | null;
  intents: { variantId: string; level: IntentLevel }[];
  liked: boolean;
  onWaitlist: boolean;
  waitlistConsent: boolean;
};

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string };
  userId?: string; // only present if you add it to the backend select, see notes
};

export type CommentPage = {
  items: Comment[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type EngagementVariant = {
  id: string;
  name: string;
  description?: string | null;
  pricePaise: number;
};
export const INTENT_OPTIONS: { value: IntentLevel; label: string }[] = [
  { value: "DEFINITELY", label: "Definitely would buy" },
  { value: "PROBABLY", label: "Probably would buy" },
  { value: "MAYBE", label: "Maybe" },
  { value: "NO", label: "Would not buy" },
];