import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '../middleware/auth';
import { ProductRepository } from '../repositories/ProductRepository';
import { ProductStatus } from '../types';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

async function uploadToCloudinary(
  buffer: Buffer,
  mimeType: string
): Promise<{ url: string; public_id: string }> {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'heme-kiitchen/products',
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'));
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

async function deleteFromCloudinary(publicId: string): Promise<void> {
  configureCloudinary();
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('[Cloudinary] Failed to delete asset:', publicId, err);
  }
}

// GET /api/products — public (active only); ?include_inactive=true for admin
router.get('/', (req: Request, res: Response) => {
  const includeInactive = req.query.include_inactive === 'true' && req.session?.isAdmin;
  const products = includeInactive
    ? ProductRepository.findAll()
    : ProductRepository.findActive();
  res.json(products);
});

// GET /api/products/:id
router.get('/:id', (req: Request, res: Response) => {
  const product = ProductRepository.findById(req.params.id as string);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(product);
});

// POST /api/products — admin only, multipart/form-data
router.post('/', requireAdmin, upload.single('image'), async (req: Request, res: Response) => {
  const { name, description, price } = req.body;
  const errors: string[] = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0)
    errors.push('name is required');
  if (!description || typeof description !== 'string')
    errors.push('description is required');
  if (!price || isNaN(Number(price)) || Number(price) <= 0)
    errors.push('price must be a positive number');
  if (!req.file) errors.push('image is required');
  else if (!ALLOWED_IMAGE_TYPES.includes(req.file.mimetype))
    errors.push('image must be a valid image type (jpeg, png, webp, gif, avif)');

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  try {
    const { url, public_id } = await uploadToCloudinary(req.file!.buffer, req.file!.mimetype);
    const product = ProductRepository.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      image_path: url,
      cloudinary_public_id: public_id,
      status: 'active' as ProductStatus,
    });
    res.status(201).json(product);
  } catch (err) {
    console.error('[Products] Upload error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// PATCH /api/products/:id — admin only, multipart/form-data
router.patch('/:id', requireAdmin, upload.single('image'), async (req: Request, res: Response) => {
  const product = ProductRepository.findById(req.params.id as string);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const { name, description, price, status } = req.body;
  const errors: string[] = [];

  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0))
    errors.push('name must be a non-empty string');
  if (price !== undefined && (isNaN(Number(price)) || Number(price) <= 0))
    errors.push('price must be a positive number');
  if (status !== undefined && !['active', 'inactive'].includes(status))
    errors.push('status must be "active" or "inactive"');
  if (req.file && !ALLOWED_IMAGE_TYPES.includes(req.file.mimetype))
    errors.push('image must be a valid image type');

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  const updates: any = {};
  if (name !== undefined) updates.name = name.trim();
  if (description !== undefined) updates.description = description.trim();
  if (price !== undefined) updates.price = Number(price);
  if (status !== undefined) updates.status = status as ProductStatus;

  if (req.file) {
    try {
      const { url, public_id } = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
      // Delete old Cloudinary asset
      if (product.cloudinary_public_id) {
        await deleteFromCloudinary(product.cloudinary_public_id);
      }
      updates.image_path = url;
      updates.cloudinary_public_id = public_id;
    } catch (err) {
      console.error('[Products] Upload error:', err);
      res.status(500).json({ error: 'Failed to upload image' });
      return;
    }
  }

  const updated = ProductRepository.update(req.params.id as string, updates);
  res.json(updated);
});

export default router;
