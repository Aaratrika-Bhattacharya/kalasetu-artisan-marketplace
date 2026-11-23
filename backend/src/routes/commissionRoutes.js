const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const prisma = require('../prismaClient');
const { authenticate, requireRole } = require('../middleware/auth');

/**
 * Request Bespoke Custom Commission
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { artisanId, title, projectScope, patronBudget } = req.body;

    if (!artisanId || !title || !projectScope || !patronBudget) {
      return res.status(400).json({
        success: false,
        error: 'Artisan ID, title, project scope, and patron budget are required.',
      });
    }

    const commissionNumber = `KS-COMM-${Math.floor(10000 + Math.random() * 90000)}`;

    // Create digital IP hash for mold copyright
    const ipHash = crypto
      .createHash('sha256')
      .update(`${commissionNumber}-${req.user.id}-${artisanId}-${Date.now()}`)
      .digest('hex');

    const commission = await prisma.customCommission.create({
      data: {
        commissionNumber,
        customerId: req.user.id,
        artisanId,
        title,
        projectScope,
        patronBudget: parseFloat(patronBudget),
        agreedPrice: parseFloat(patronBudget),
        digitalIpHash: `urn:kalasetu:ip:${ipHash}`,
        status: 'ESCROW_LOCKED',
        milestones: {
          create: [
            {
              title: 'Stage 1: Raw Alluvial Clay & Armature Procurement',
              percentage: 25.0,
              amount: Math.round(patronBudget * 0.25),
              status: 'APPROVED', // Initial advance unlocked for materials
              patronApproved: true,
              disbursedAt: new Date(),
            },
            {
              title: 'Stage 2: 360° Clay Prototype Review & Firing Approval',
              percentage: 35.0,
              amount: Math.round(patronBudget * 0.35),
              status: 'ESCROW_HELD',
              patronApproved: false,
            },
            {
              title: 'Stage 3: Wood-Kiln Firing & Timber-Crated Dispatch',
              percentage: 40.0,
              amount: Math.round(patronBudget * 0.40),
              status: 'ESCROW_HELD',
              patronApproved: false,
            },
          ],
        },
      },
      include: { milestones: true, artisan: { include: { user: true } } },
    });

    res.status(201).json({
      success: true,
      message: 'Custom commission created with 3-stage milestone escrow protection.',
      commission,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * List User or Artisan Commissions
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const where = {};
    if (req.user.role === 'ARTISAN' && req.user.artisanProfile) {
      where.artisanId = req.user.artisanProfile.id;
    } else {
      where.customerId = req.user.id;
    }

    const commissions = await prisma.customCommission.findMany({
      where,
      include: {
        milestones: true,
        customer: { select: { fullName: true, phoneNumber: true } },
        artisan: { include: { user: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, count: commissions.length, commissions });
  } catch (err) {
    next(err);
  }
});

/**
 * Approve Milestone & Disburse Escrow
 */
router.post('/:id/milestones/:milestoneId/approve', authenticate, async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;

    const milestone = await prisma.commissionMilestone.findFirst({
      where: { id: milestoneId, commissionId: id },
    });

    if (!milestone) {
      return res.status(404).json({ success: false, error: 'Milestone not found.' });
    }

    const updated = await prisma.commissionMilestone.update({
      where: { id: milestoneId },
      data: {
        status: 'DISBURSED',
        patronApproved: true,
        disbursedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: `Escrow milestone "${milestone.title}" approved and ₹${milestone.amount} disbursed to artisan.`,
      milestone: updated,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
