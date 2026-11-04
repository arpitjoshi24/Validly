import type { Role } from "@/types";

export const ROLE_HOME: Record<Role, string> = {
  FOUNDER: "/founder",
  CONSUMER: "/consumer",
  ADMIN: "/admin",
};

export const ROLE_LABEL: Record<Role, string> = {
  FOUNDER: "Founder",
  CONSUMER: "Consumer",
  ADMIN: "Admin",
};

export const INTEREST_SUGGESTIONS = [
  "Snacks", "Beverages", "Skincare", "Fitness", "Home & kitchen", "Fashion", "Pet care", "Stationery",
];