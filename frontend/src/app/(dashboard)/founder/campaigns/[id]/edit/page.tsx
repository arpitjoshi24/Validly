"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { campaignsApi } from "@/lib/campaigns";
import type { Campaign } from "@/types/campaign";

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    campaignsApi
      .get(id)
      .then(setCampaign)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load this campaign."));
  }, [id]);

  return (
    <RoleGuard roles={["FOUNDER"]}>
      <h1 className="text-3xl font-bold">Edit campaign</h1>
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      {!campaign && !error && <p className="mt-4 text-sm text-ink-soft">Loading...</p>}

      {campaign && campaign.status !== "DRAFT" && (
        <p className="mt-4 text-sm text-ink-soft">
          Only draft campaigns can be edited.{" "}
          <Link href={`/founder/campaigns/${id}`} className="text-brand underline">Back to campaign</Link>
        </p>
      )}

      {campaign && campaign.status === "DRAFT" && (
        <CampaignForm
          mode="edit"
          initial={campaign}
          submitLabel="Save changes"
          onSubmit={async ({ productId: _ignored, ...payload }) => {
            await campaignsApi.update(id, payload);
            router.push(`/founder/campaigns/${id}`);
          }}
        />
      )}
    </RoleGuard>
  );
}