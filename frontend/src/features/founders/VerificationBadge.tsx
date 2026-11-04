import { Badge } from "@/components/ui/Badge";
import type { VerificationStatus } from "@/types";

const MAP: Record<VerificationStatus, { tone: "warning" | "success" | "danger"; label: string }> = {
  PENDING: { tone: "warning", label: "Verification pending" },
  VERIFIED: { tone: "success", label: "Verified" },
  REJECTED: { tone: "danger", label: "Verification rejected" },
};

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const { tone, label } = MAP[status];
  return <Badge tone={tone}>{label}</Badge>;
}