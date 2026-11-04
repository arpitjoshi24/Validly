import { asyncHandler } from '../../utils/asyncHandler.js';
import { toPublicCampaignDto } from '../../utils/serializers.js';
import * as service from './discovery.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, pagination } = await service.listLive(req.validated.query);
  res.json({ success: true, data: { items: items.map(toPublicCampaignDto), pagination } });
});

export const categories = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { categories: service.listCategories() } });
});

export const getOne = asyncHandler(async (req, res) => {
  const campaign = await service.getLive(req.validated.params.campaignId);
  res.json({ success: true, data: { campaign: toPublicCampaignDto(campaign) } });
});