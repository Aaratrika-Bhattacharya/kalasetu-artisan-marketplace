const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { authenticate, requireRole } = require('../middleware/auth');

/**
 * List all verified artisans
 */
router.get('/', async (req, res, next) => {
  try {
    const { clusterId, state, search } = req.query;

    const where = {
      verificationStatus: 'VERIFIED',
    };

    if (clusterId) where.clusterId = clusterId;
    if (state) where.cluster = { state };

    const artisans = await prisma.artisanProfile.findMany({
      where,
      include: {
        user: { select: { fullName: true, avatarUrl: true, phoneNumber: true } },
        cluster: true,
        _count: { select: { products: true, commissions: true } },
      },
    });

    const formatted = artisans.map((a) => ({
      id: a.id,
      userId: a.userId,
      brandName: a.brandName,
      artisanName: a.user.fullName,
      artisanLineage: a.artisanLineage,
      storyNarrative: a.storyNarrative,
      cluster: a.cluster.name,
      clusterSlug: a.cluster.slug,
      state: a.cluster.state,
      isGiTagged: a.cluster.isGiTagged,
      giRegNumber: a.cluster.giRegNumber,
      avatarUrl: a.user.avatarUrl,
      productsCount: a._count.products,
      experienceYears: a.experienceYears,
      workshopSize: a.workshopSize,
      hourlyEarningBase: a.hourlyEarningBase,
    }));

    res.json({ success: true, count: formatted.length, artisans: formatted });
  } catch (err) {
    next(err);
  }
});

/**
 * Get single artisan storefront by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const artisan = await prisma.artisanProfile.findUnique({
      where: { id },
      include: {
        user: { select: { fullName: true, avatarUrl: true, preferredLang: true } },
        cluster: true,
        products: {
          where: { status: 'ACTIVE' },
          include: { images: true, packagingSpec: true },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { fullName: true } } },
        },
      },
    });

    if (!artisan) {
      return res.status(404).json({ success: false, error: 'Artisan profile not found.' });
    }

    const formattedProducts = artisan.products.map((p) => ({
      ...p,
      tags: JSON.parse(p.tags || '[]'),
      vernacularTitles: p.vernacularTitles ? JSON.parse(p.vernacularTitles) : null,
      vernacularDescs: p.vernacularDescs ? JSON.parse(p.vernacularDescs) : null,
    }));

    res.json({
      success: true,
      artisan: {
        id: artisan.id,
        brandName: artisan.brandName,
        artisanName: artisan.user.fullName,
        artisanLineage: artisan.artisanLineage,
        storyNarrative: artisan.storyNarrative,
        workshopAddress: artisan.workshopAddress,
        verificationStatus: artisan.verificationStatus,
        experienceYears: artisan.experienceYears,
        workshopSize: artisan.workshopSize,
        hourlyEarningBase: artisan.hourlyEarningBase,
        voiceIntroAudioUrl: artisan.voiceIntroAudioUrl,
        cluster: {
          id: artisan.cluster.id,
          name: artisan.cluster.name,
          state: artisan.cluster.state,
          isGiTagged: artisan.cluster.isGiTagged,
          giRegNumber: artisan.cluster.giRegNumber,
          materials: JSON.parse(artisan.cluster.materialsUsed || '[]'),
        },
        products: formattedProducts,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Update authenticated artisan profile
 */
router.patch('/profile', authenticate, requireRole(['ARTISAN', 'ADMIN']), async (req, res, next) => {
  try {
    const { brandName, storyNarrative, workshopAddress, bankAccountNumber, bankIfscCode, upiId, experienceYears } = req.body;

    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!artisan) {
      return res.status(404).json({ success: false, error: 'Artisan profile not associated with this account.' });
    }

    const updated = await prisma.artisanProfile.update({
      where: { id: artisan.id },
      data: {
        brandName: brandName || artisan.brandName,
        storyNarrative: storyNarrative || artisan.storyNarrative,
        workshopAddress: workshopAddress || artisan.workshopAddress,
        bankAccountNumber: bankAccountNumber || artisan.bankAccountNumber,
        bankIfscCode: bankIfscCode || artisan.bankIfscCode,
        upiId: upiId || artisan.upiId,
        experienceYears: experienceYears ? parseInt(experienceYears, 10) : artisan.experienceYears,
      },
    });

    res.json({ success: true, message: 'Profile updated successfully.', artisan: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * Artisan Dashboard Overview for logged in artisan
 */
router.get('/my/dashboard', authenticate, requireRole(['ARTISAN']), async (req, res, next) => {
  try {
    const profile = await prisma.artisanProfile.findUnique({
      where: { userId: req.user.id },
      include: { cluster: true },
    });

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Artisan profile not found.' });
    }

    // Products
    const products = await prisma.product.findMany({
      where: { artisanId: profile.id },
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });

    // Order items for this artisan
    const orderItems = await prisma.orderItem.findMany({
      where: { artisanId: profile.id },
      include: {
        order: { select: { orderNumber: true, status: true, createdAt: true, shippingAddress: true } },
        product: { select: { title: true, images: true } },
      },
      orderBy: { id: 'desc' },
    });

    // Payout records
    const payouts = await prisma.payoutRecord.findMany({
      where: { artisanId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    const totalEarned = orderItems
      .filter((item) => ['PAID', 'PROCESSING', 'PACKED_SAFE_TRANSIT', 'SHIPPED', 'DELIVERED'].includes(item.order.status))
      .reduce((sum, item) => sum + item.artisanUnitShare * item.quantity, 0);

    const pendingPackagingCount = orderItems.filter(
      (item) => item.packagingStatus === 'PENDING' && item.order.status === 'PAID'
    ).length;

    res.json({
      success: true,
      profile: {
        id: profile.id,
        brandName: profile.brandName,
        artisanName: req.user.fullName,
        cluster: profile.cluster.name,
        verificationStatus: profile.verificationStatus,
        upiId: profile.upiId,
        bankAccountMasked: profile.bankAccountNumber ? `••••${profile.bankAccountNumber.slice(-4)}` : null,
      },
      metrics: {
        totalProductsCount: products.length,
        totalOrdersCount: orderItems.length,
        totalArtisanEarnedInr: totalEarned,
        pendingPackagingCount,
        breakagePreventedCount: orderItems.filter((i) => !i.breakageClaimed).length,
      },
      recentProducts: products.slice(0, 5),
      recentOrders: orderItems.slice(0, 10),
      recentPayouts: payouts,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
