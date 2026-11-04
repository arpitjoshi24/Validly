import { asyncHandler } from '../../utils/asyncHandler.js';
import { toImageDto, toProductDto } from '../../utils/serializers.js';
import * as service from './products.service.js';

export const create = asyncHandler(async (req, res) => {
  const product = await service.createProduct(req.user.id, req.validated.body);
  res.status(201).json({ success: true, data: { product: toProductDto(product) } });
});

export const list = asyncHandler(async (req, res) => {
  const { items, pagination } = await service.listProducts(req.user.id, req.validated.query);
  res.json({ success: true, data: { items: items.map(toProductDto), pagination } });
});

export const get = asyncHandler(async (req, res) => {
  const product = await service.getProduct(req.validated.params.id, req.user.id);
  res.json({ success: true, data: { product: toProductDto(product) } });
});

export const update = asyncHandler(async (req, res) => {
  const product = await service.updateProduct(
    req.validated.params.id,
    req.user.id,
    req.validated.body
  );
  res.json({ success: true, data: { product: toProductDto(product) } });
});

export const remove = asyncHandler(async (req, res) => {
  await service.deleteProduct(req.validated.params.id, req.user.id);
  res.json({ success: true, message: 'Product deleted' });
});

export const uploadUrl = asyncHandler(async (req, res) => {
  const data = await service.requestUploadUrl(
    req.validated.params.id,
    req.user.id,
    req.validated.body
  );
  res.json({ success: true, data });
});

export const addImage = asyncHandler(async (req, res) => {
  const image = await service.registerImage(
    req.validated.params.id,
    req.user.id,
    req.validated.body
  );
  res.status(201).json({ success: true, data: { image: toImageDto(image) } });
});

export const removeImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.validated.params;
  await service.deleteImage(id, imageId, req.user.id);
  res.json({ success: true, message: 'Image removed' });
});