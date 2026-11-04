export type Role = "FOUNDER" | "CONSUMER" | "ADMIN";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface FounderProfile {
  businessName: string;
  category: string;
  website: string;
  description: string;
  verificationStatus: VerificationStatus;
}

export interface ConsumerProfile {
  interests: string[];
}