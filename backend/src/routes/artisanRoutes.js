const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { authenticate, requireRole } = require('../middleware/auth');
const { readCraftDetails } = require('../services/productDetails');

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
      verificationStatus: a.verificationStatus,
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
      craftDetails: readCraftDetails(p.craftDetails),
      dimensions: { lengthCm: p.lengthCm, widthCm: p.widthCm, heightCm: p.heightCm, weightGrams: p.weightGrams },
      cluster: { ...artisan.cluster, materialsUsed: JSON.parse(artisan.cluster.materialsUsed || '[]') },
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
        avatarUrl: artisan.user.avatarUrl,
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
        products: formattedProducts.map((product) => ({
          ...product, artisan: { id, artisanName: artisan.user.fullName, brandName: artisan.brandName },
        })),
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
    const { brandName, storyNarrative, workshopAddress, bankAccountNumber, bankIfscCode, upiId, experienceYears, weeklyCapacity } = req.body;

    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!artisan) {
      return res.status(404).json({ success: false, error: 'Artisan profile not associated with this account.' });
    }

    if (weeklyCapacity !== undefined && (!Number.isInteger(weeklyCapacity) || weeklyCapacity < 0 || weeklyCapacity > 100000)) {
      return res.status(400).json({ error: 'Capacity must be a whole number between 0 and 100,000.' });
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
        weeklyCapacity,
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
      orderBy: { order: { createdAt: 'desc' } },
    });

    // Payout records
    const payouts = await prisma.payoutRecord.findMany({
      where: { artisanId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    const paidItems = orderItems.filter((item) => ['PAID', 'PROCESSING', 'PACKED_SAFE_TRANSIT', 'SHIPPED', 'DELIVERED'].includes(item.order.status));
    const totalEarned = paidItems.reduce((sum, item) => sum + item.artisanUnitShare * item.quantity, 0);

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
        weeklyCapacity: profile.weeklyCapacity,
        upiId: profile.upiId,
        bankAccountMasked: profile.bankAccountNumber ? `••••${profile.bankAccountNumber.slice(-4)}` : null,
      },
      metrics: {
        totalProductsCount: products.length,
        totalOrdersCount: new Set(orderItems.map((item) => item.orderId)).size,
        grossSalesInr: paidItems.reduce((sum, item) => sum + item.subtotal, 0),
        totalArtisanEarnedInr: totalEarned,
        pendingPackagingCount,
        breakagePreventedCount: orderItems.filter((i) => !i.breakageClaimed).length,
      },
      recentProducts: products.slice(0, 5),
      products: products.map((product) => ({ ...product, craftDetails: readCraftDetails(product.craftDetails) })),
      recentOrders: orderItems.slice(0, 10),
      fulfillmentQueue: orderItems.filter((item) => ['PAID', 'PROCESSING', 'PACKED_SAFE_TRANSIT'].includes(item.order.status)),
      recentPayouts: payouts,
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/my/orders/:id/packaging', authenticate, requireRole(['ARTISAN']), async (req, res, next) => {
  try {
    const previousStatus = { PACKED_IN_BIO_STRAW: 'PENDING', INSPECTED: 'PACKED_IN_BIO_STRAW' };
    const { packagingStatus } = req.body;
    if (!Object.hasOwn(previousStatus, packagingStatus)) {
      return res.status(400).json({ error: 'Invalid packaging status.' });
    }
    const profile = await prisma.artisanProfile.findUnique({ where: { userId: req.user.id }, select: { id: true } });
    if (!profile) return res.status(404).json({ error: 'Artisan profile not found.' });
    const { count } = await prisma.orderItem.updateMany({
      where: {
        id: req.params.id,
        artisanId: profile.id,
        order: { status: { in: ['PAID', 'PROCESSING', 'PACKED_SAFE_TRANSIT'] } },
        packagingStatus: previousStatus[packagingStatus],
      },
      data: { packagingStatus },
    });
    if (!count) return res.status(409).json({ error: 'This item is unavailable or its packaging status has changed.' });
    res.json({ success: true, packagingStatus });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
