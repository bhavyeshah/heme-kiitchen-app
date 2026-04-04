import { Router, Request, Response } from 'express';
import { requireAdmin } from '../middleware/auth';
import { SiteContentRepository } from '../repositories/SiteContentRepository';

const router = Router();

// GET /api/site-content — public
router.get('/', (_req: Request, res: Response) => {
  res.json(SiteContentRepository.get());
});

// PATCH /api/site-content — admin only
router.patch('/', requireAdmin, (req: Request, res: Response) => {
  const { tagline, description, highlights, instagram_handle } = req.body;
  const errors: string[] = [];

  if (tagline !== undefined) {
    if (typeof tagline !== 'string' || tagline.trim().length === 0) {
      errors.push('tagline must be a non-empty string');
    } else if (tagline.length > 150) {
      errors.push('tagline must be 150 characters or fewer');
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string') {
      errors.push('description must be a string');
    } else if (description.length > 500) {
      errors.push('description must be 500 characters or fewer');
    }
  }

  if (highlights !== undefined) {
    if (!Array.isArray(highlights)) {
      errors.push('highlights must be an array');
    } else {
      highlights.forEach((h: unknown, i: number) => {
        if (typeof h !== 'string') {
          errors.push(`highlights[${i}] must be a string`);
        } else if (h.length > 80) {
          errors.push(`highlights[${i}] must be 80 characters or fewer`);
        }
      });
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  const partial: any = {};
  if (tagline !== undefined) partial.tagline = tagline.trim();
  if (description !== undefined) partial.description = description;
  if (highlights !== undefined) partial.highlights = highlights;
  if (instagram_handle !== undefined) partial.instagram_handle = instagram_handle || null;

  const updated = SiteContentRepository.update(partial);
  res.json(updated);
});

export default router;
