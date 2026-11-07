import { asyncHandler } from '../../utils/asyncHandler.js';
import * as service from './engagement.service.js';

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const done = (res, message) => res.json({ success: true, message });

export const castVote = asyncHandler(async (req, res) => {
  const { campaignId } = req.validated.params;
  const vote = await service.castVote(campaignId, req.user.id, req.validated.body.variantId);
  ok(res, { votedVariantId: vote.variantId });
});

export const removeVote = asyncHandler(async (req, res) => {
  await service.removeVote(req.validated.params.campaignId, req.user.id);
  done(res, 'Vote removed');
});

export const setIntent = asyncHandler(async (req, res) => {
  const intent = await service.setIntent(
    req.validated.params.campaignId,
    req.user.id,
    req.validated.body
  );
  ok(res, { intent: { variantId: intent.variantId, level: intent.level } });
});

export const like = asyncHandler(async (req, res) => {
  await service.like(req.validated.params.campaignId, req.user.id);
  ok(res, { liked: true });
});

export const unlike = asyncHandler(async (req, res) => {
  await service.unlike(req.validated.params.campaignId, req.user.id);
  ok(res, { liked: false });
});

export const listComments = asyncHandler(async (req, res) => {
  const data = await service.listComments(req.validated.params.campaignId, req.validated.query);
  ok(res, data);
});

export const createComment = asyncHandler(async (req, res) => {
  const comment = await service.createComment(
    req.validated.params.campaignId,
    req.user.id,
    req.validated.body.content
  );
  ok(res, { comment }, 201);
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { campaignId, commentId } = req.validated.params;
  await service.deleteOwnComment(campaignId, commentId, req.user.id);
  done(res, 'Comment deleted');
});

export const joinWaitlist = asyncHandler(async (req, res) => {
  const entry = await service.joinWaitlist(
    req.validated.params.campaignId,
    req.user.id,
    req.validated.body.consentToShareEmail
  );
  ok(res, { onWaitlist: true, waitlistConsent: entry.consentToShareEmail }, 201);
});

export const leaveWaitlist = asyncHandler(async (req, res) => {
  await service.leaveWaitlist(req.validated.params.campaignId, req.user.id);
  ok(res, { onWaitlist: false });
});

export const me = asyncHandler(async (req, res) => {
  ok(res, await service.getMyEngagement(req.validated.params.campaignId, req.user.id));
});

export const founderWaitlist = asyncHandler(async (req, res) => {
  const data = await service.getFounderWaitlist(
    req.validated.params.id,
    req.user.id,
    req.validated.query
  );
  ok(res, data);
});