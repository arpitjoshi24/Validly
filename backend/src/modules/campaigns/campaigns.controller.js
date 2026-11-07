import { asyncHandler } from '../../utils/asyncHandler.js';
import { toCampaignDto } from '../../utils/serializers.js';
import * as service from './campaigns.service.js';

export const create = asyncHandler(async (req, res) => {
  const campaign = await service.createCampaign(req.user.id, req.validated.body);
  res.status(201).json({ success: true, data: { campaign: toCampaignDto(campaign) } });
});

export const list = asyncHandler(async (req, res) => {
  const { items, pagination } = await service.listCampaigns(req.user.id, req.validated.query);
  res.json({ success: true, data: { items: items.map(toCampaignDto), pagination } });
});

export const get = asyncHandler(async (req, res) => {
  const campaign = await service.getCampaign(req.validated.params.id, req.user.id);
  res.json({ success: true, data: { campaign: toCampaignDto(campaign) } });
});

export const update = asyncHandler(async (req, res) => {
  const campaign = await service.updateCampaign(
    req.validated.params.id,
    req.user.id,
    req.validated.body
  );
  res.json({ success: true, data: { campaign: toCampaignDto(campaign) } });
});

export const publish = asyncHandler(async (req, res) => {
  const campaign = await service.publishCampaign(req.validated.params.id, req.user.id);
  res.json({ success: true, data: { campaign: toCampaignDto(campaign) } });
});

export const close = asyncHandler(async (req, res) => {
  const campaign = await service.closeCampaign(req.validated.params.id, req.user.id);
  res.json({ success: true, data: { campaign: toCampaignDto(campaign) } });
});

export const remove = asyncHandler(async (req, res) => {
  await service.deleteCampaign(req.validated.params.id, req.user.id);
  res.json({ success: true, message: 'Campaign deleted' });
});
export const results = asyncHandler(async (req, res) => {
  const data = await service.getCampaignResults(req.validated.params.id, req.user.id);
  res.json({ success: true, data });
});