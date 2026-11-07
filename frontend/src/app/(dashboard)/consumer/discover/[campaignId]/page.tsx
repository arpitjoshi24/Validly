"use client";

import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { CampaignDetail } from "@/features/discovery/CampaignDetail";

export default function CampaignPage() {
  const { campaignId } = useParams<{ campaignId: string }>();

  return (
    <RoleGuard roles={["CONSUMER"]}>
      <CampaignDetail campaignId={campaignId} />
    </RoleGuard>
  );
}