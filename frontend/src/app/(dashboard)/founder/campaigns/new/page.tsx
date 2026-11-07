"use client";

import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { campaignsApi } from "@/lib/campaigns";

export default function NewCampaignPage() {
  const router = useRouter();
  return (
    <RoleGuard roles={["FOUNDER"]}>
      <h1 className="text-3xl font-bold">New campaign</h1>
      <p className="mt-2 text-ink-soft">Your campaign is saved as a draft. You can edit it until you publish.</p>
      <CampaignForm
        mode="create"
        submitLabel="Save draft"
        onSubmit={async (payload) => {
          const campaign = await campaignsApi.create(payload);
          router.push(`/founder/campaigns/${campaign.id}`);
        }}
      />
    </RoleGuard>
  );
}