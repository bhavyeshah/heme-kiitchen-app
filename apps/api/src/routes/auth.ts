import { Router, Request, Response } from 'express';

const router = Router();

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    res.status(500).json({ error: 'ADMIN_SECRET not configured' });
    return;
  }

  if (!password || password !== adminSecret) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  req.session.isAdmin = true;
  res.json({ success: true });
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to logout' });
      return;
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// GET /api/auth/me — check session
router.get('/me', (req: Request, res: Response) => {
  res.json({ isAdmin: !!req.session?.isAdmin });
});

export default router;
