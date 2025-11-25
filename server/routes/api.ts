/**
 * API Routes Configuration
 * Sistema ICARUS v5.0
 */

import express from 'express';
import { handleContactSubmission, rateLimitMiddleware } from '../api/contact';
import {
  getDashboardKpis,
  getDistributionBySpecialty,
  getDistributionByState,
  getMonthlyRevenue,
} from '../api/dashboard';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '5.0.0',
  });
});

// Contact form endpoint
router.post('/contact', rateLimitMiddleware, handleContactSubmission);

// Dashboard endpoints
router.get('/dashboard/kpis', getDashboardKpis);
router.get('/dashboard/distribuicao-especialidades', getDistributionBySpecialty);
router.get('/dashboard/distribuicao-estados', getDistributionByState);
router.get('/dashboard/faturamento-mensal', getMonthlyRevenue);

export default router;
