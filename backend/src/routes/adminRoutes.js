const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { authenticate, requireRole } = require('../middleware/auth');

/**
 * Admin Overview Analytics & Metrics
 */
router.get('/overview', authenticate, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const [
      totalArtisans,
      verifiedArtisans,
      pendingArtisans,
      totalProducts,
      orders,
      commissions,
      auditLogs,
    ] = await Promise.all([
      prisma.artisanProfile.count(),
      prisma.artisanProfile.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.artisanProfile.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.product.count(),
      prisma.order.findMany({ include: { items: true, payment: true } }),
      prisma.customCommission.findMany({ include: { milestones: true } }),
      prisma.fairTradeAuditLog.findMany(),
    ]);

    const paidOrders = orders.filter((o) => ['PAID', 'PROCESSING', 'PACKED_SAFE_TRANSIT', 'SHIPPED', 'DELIVERED'].includes(o.status));
    const totalGmv = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalArtisanPayouts = paidOrders.reduce((sum, o) => sum + o.artisanShareTotal, 0);
    const totalPlatformRevenue = paidOrders.reduce((sum, o) => sum + o.platformFeeTotal, 0);
    const totalBreakagePoolFund = auditLogs.reduce((sum, a) => sum + a.breakagePoolReserve, 0);

    const breakageClaimsCount = orders.reduce(
      (sum, o) => sum + o.items.filter((i) => i.breakageClaimed).length,
      0
    );
    const totalItemsShipped = orders.reduce((sum, o) => sum + o.items.length, 0);
    const transitBreakageRatePct = totalItemsShipped > 0
      ? ((breakageClaimsCount / totalItemsShipped) * 100).toFixed(2)
      : '0.00';

    res.json({
      success: true,
      analytics: {
        totalGmvInr: totalGmv,
        totalArtisanPayoutsInr: totalArtisanPayouts,
        totalPlatformRevenueInr: totalPlatformRevenue,
        totalBreakagePoolFundInr: totalBreakagePoolFund,
        totalArtisans,
        verifiedArtisans,
        pendingArtisans,
        totalProducts,
        totalOrdersCount: orders.length,
        paidOrdersCount: paidOrders.length,
        totalCommissionsCount: commissions.length,
        breakageClaimsCount,
        transitBreakageRatePct: parseFloat(transitBreakageRatePct),
        fieldworkBreakageBaselinePct: 27.5, // From fieldwork benchmark
        breakageReductionDeltaPct: (27.5 - parseFloat(transitBreakageRatePct)).toFixed(1),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Pending Verification Queue (Artisans and Products)
 */
router.get('/pending-queue', authenticate, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const [pendingArtisans, pendingProducts] = await Promise.all([
      prisma.artisanProfile.findMany({
        where: { verificationStatus: 'PENDING' },
        include: { user: true, cluster: true },
      }),
      prisma.product.findMany({
        where: { status: 'PENDING_APPROVAL' },
        include: { artisan: { include: { user: true } }, cluster: true, images: true },
      }),
    ]);

    res.json({
      success: true,
      pendingArtisans,
      pendingProducts,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Approve / Reject Artisan
 */
router.patch('/artisan/:id/status', authenticate, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // VERIFIED, REJECTED, UNDER_REVIEW

    const updated = await prisma.artisanProfile.update({
      where: { id },
      data: {
        verificationStatus: status,
        verificationNotes: notes || null,
      },
    });

    res.json({ success: true, message: `Artisan status updated to ${status}.`, artisan: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * Approve / Flag Product
 */
router.patch('/product/:id/status', authenticate, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, moderationNotes } = req.body; // ACTIVE, INACTIVE, DRAFT

    const updated = await prisma.product.update({
      where: { id },
      data: {
        status,
        aiModerationNotes: moderationNotes || null,
      },
    });

    res.json({ success: true, message: `Product status updated to ${status}.`, product: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * Disburse Batch Payouts to Artisans
 */
router.post('/disburse-payouts', authenticate, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const { artisanId, amount, payoutMethod = 'UPI' } = req.body;

    const payout = await prisma.payoutRecord.create({
      data: {
        artisanId,
        amount: parseFloat(amount),
        currency: 'INR',
        payoutMethod,
        transferRef: `UTR${Date.now()}`,
        status: 'COMPLETED',
        disbursedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: `Batch payout of ₹${amount} disbursed successfully to artisan via ${payoutMethod}.`,
      payout,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
