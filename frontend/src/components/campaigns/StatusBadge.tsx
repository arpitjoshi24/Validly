import type { CampaignStatus } from "@/types/campaign";

const styles: Record<CampaignStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  ACTIVE: "bg-green-100 text-green-800",
  CLOSED: "bg-red-100 text-red-800",
};

const labels: Record<CampaignStatus, string> = { DRAFT: "Draft", ACTIVE: "Active", CLOSED: "Closed" };

export function StatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}