/**
 * API Routes Configuration
 * Sistema ICARUS v5.0
 */

import express from 'express';
import { handleContactSubmission, rateLimitMiddleware } from '../api/contact';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '5.0.0'
  });
});

// Contact form endpoint
router.post('/contact', rateLimitMiddleware, handleContactSubmission);

export default router;

