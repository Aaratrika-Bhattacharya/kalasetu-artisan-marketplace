const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { authenticate, requireRole, optionalAuth } = require('../middleware/auth');
const logisticsService = require('../services/logisticsService');
const fairTradeService = require('../services/fairTradeService');

/**
 * List products with multi-facet filters
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      category,
      clusterId,
      giOnly,
      minPrice,
      maxPrice,
      fragilityClass,
      search,
      artisanId,
      page = 1,
      limit = 20,
    } = req.query;

    const where = {
      status: 'ACTIVE',
    };

    if (category) where.category = category;
    if (clusterId) where.clusterId = clusterId;
    if (artisanId) where.artisanId = artisanId;
    if (fragilityClass) where.fragilityClass = fragilityClass;

    if (giOnly === 'true') {
      where.cluster = { isGiTagged: true };
    }

    if (minPrice || maxPrice) {
      where.retailPrice = {};
      if (minPrice) where.retailPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.retailPrice.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [totalCount, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          images: true,
          cluster: true,
          artisan: {
            include: { user: { select: { fullName: true, avatarUrl: true } } },
          },
          packagingSpec: true,
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const formatted = products.map((p) => {
      const breakdown = fairTradeService.calculateBreakdown(p.retailPrice, {
        artisanSharePct: p.artisanBasePrice / p.retailPrice,
      });

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        vernacularTitles: p.vernacularTitles ? JSON.parse(p.vernacularTitles) : null,
        description: p.description,
        vernacularDescs: p.vernacularDescs ? JSON.parse(p.vernacularDescs) : null,
        category: p.category,
        subCategory: p.subCategory,
        tags: JSON.parse(p.tags || '[]'),
        retailPrice: p.retailPrice,
        artisanBasePrice: p.artisanBasePrice,
        marketBenchmarkPrice: p.marketBenchmarkPrice,
        fairShareBreakdown: breakdown,
        stockQuantity: p.stockQuantity,
        isMadeToOrder: p.isMadeToOrder,
        leadTimeDays: p.leadTimeDays,
        dimensions: {
          lengthCm: p.lengthCm,
          widthCm: p.widthCm,
          heightCm: p.heightCm,
          weightGrams: p.weightGrams,
        },
        fragilityClass: p.fragilityClass,
        safeTransitCertified: p.safeTransitCertified,
        packagingSpec: p.packagingSpec,
        images: p.images,
        cluster: {
          id: p.cluster.id,
          name: p.cluster.name,
          state: p.cluster.state,
          isGiTagged: p.cluster.isGiTagged,
          giRegNumber: p.cluster.giRegNumber,
        },
        artisan: {
          id: p.artisan.id,
          brandName: p.artisan.brandName,
          artisanName: p.artisan.user.fullName,
          artisanLineage: p.artisan.artisanLineage,
          avatarUrl: p.artisan.user.avatarUrl,
        },
        reviewsCount: p._count.reviews,
      };
    });

    res.json({
      success: true,
      totalCount,
      page: parseInt(page, 10),
      totalPages: Math.ceil(totalCount / take),
      products: formatted,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Get single product by Slug or ID
 */
router.get('/:slugOrId', optionalAuth, async (req, res, next) => {
  try {
    const { slugOrId } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
      },
      include: {
        images: true,
        cluster: true,
        artisan: {
          include: {
            user: { select: { fullName: true, avatarUrl: true } },
          },
        },
        packagingSpec: true,
        reviews: {
          include: { user: { select: { fullName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    const breakdown = fairTradeService.calculateBreakdown(product.retailPrice, {
      artisanSharePct: product.artisanBasePrice / product.retailPrice,
    });

    const averageRating =
      product.reviews.length > 0
        ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
        : '5.0';

    res.json({
      success: true,
      product: {
        ...product,
        tags: JSON.parse(product.tags || '[]'),
        vernacularTitles: product.vernacularTitles ? JSON.parse(product.vernacularTitles) : null,
        vernacularDescs: product.vernacularDescs ? JSON.parse(product.vernacularDescs) : null,
        fairShareBreakdown: breakdown,
        averageRating: parseFloat(averageRating),
        reviewsCount: product.reviews.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Create Product (Authenticated Artisan)
 */
router.post('/', authenticate, requireRole(['ARTISAN', 'ADMIN']), async (req, res, next) => {
  try {
    const {
      title,
      description,
      vernacularTitles,
      vernacularDescs,
      category,
      subCategory,
      tags = [],
      retailPrice,
      artisanBasePrice,
      marketBenchmarkPrice,
      stockQuantity = 1,
      isMadeToOrder = false,
      leadTimeDays = 3,
      lengthCm = 15,
      widthCm = 15,
      heightCm = 20,
      weightGrams = 800,
      imageUrls = [],
    } = req.body;

    const profile = await prisma.artisanProfile.findUnique({
      where: { userId: req.user.id },
      include: { cluster: true },
    });

    if (!profile) {
      return res.status(403).json({ success: false, error: 'Only registered artisans can list products.' });
    }

    // Auto-assess fragility via logistics engine
    const fragilityAssessment = logisticsService.assessFragility({
      craftType: profile.cluster.name,
      category,
      dimensions: { lengthCm, widthCm, heightCm, weightGrams },
      materials: JSON.parse(profile.cluster.materialsUsed || '[]'),
    });

    // Find or link PackagingSpec
    let packagingSpec = await prisma.fragilitySpec.findUnique({
      where: { code: fragilityAssessment.packagingCode },
    });

    if (!packagingSpec) {
      packagingSpec = await prisma.fragilitySpec.create({
        data: {
          code: fragilityAssessment.packagingCode,
          name: fragilityAssessment.packagingCode.replace(/_/g, ' '),
          fragilityClass: fragilityAssessment.fragilityClass,
          packagingInstructions: JSON.stringify(fragilityAssessment.packagingInstructions),
          cushioningMaterial: 'Bio-Composite Shock Cushioning',
          dropTestRatingFeet: fragilityAssessment.dropRatingFeet,
          boxCostInr: fragilityAssessment.boxCostInr,
        },
      });
    }

    // Generate unique slug
    const cleanSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const slug = `${cleanSlug}-${Math.random().toString(36).substring(2, 7)}`;

    const numRetail = parseFloat(retailPrice);
    const numArtisanBase = artisanBasePrice ? parseFloat(artisanBasePrice) : Math.round(numRetail * 0.85);

    const product = await prisma.product.create({
      data: {
        artisanId: profile.id,
        clusterId: profile.clusterId,
        title,
        slug,
        vernacularTitles: vernacularTitles ? JSON.stringify(vernacularTitles) : null,
        description,
        vernacularDescs: vernacularDescs ? JSON.stringify(vernacularDescs) : null,
        category: category || 'Home Decor',
        subCategory,
        tags: JSON.stringify(Array.isArray(tags) ? tags : [tags]),
        retailPrice: numRetail,
        artisanBasePrice: numArtisanBase,
        marketBenchmarkPrice: marketBenchmarkPrice ? parseFloat(marketBenchmarkPrice) : Math.round(numRetail * 1.6),
        stockQuantity: parseInt(stockQuantity, 10),
        isMadeToOrder: Boolean(isMadeToOrder),
        leadTimeDays: parseInt(leadTimeDays, 10),
        lengthCm: parseFloat(lengthCm),
        widthCm: parseFloat(widthCm),
        heightCm: parseFloat(heightCm),
        weightGrams: parseFloat(weightGrams),
        fragilityClass: fragilityAssessment.fragilityClass,
        safeTransitCertified: true,
        packagingTypeId: packagingSpec.id,
        status: 'ACTIVE',
        images: {
          create: imageUrls.length > 0
            ? imageUrls.map((url, idx) => ({
                imageUrl: url,
                isPrimary: idx === 0,
                sortOrder: idx,
              }))
            : [
                {
                  imageUrl:
                    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
                  isPrimary: true,
                  sortOrder: 0,
                },
              ],
        },
      },
      include: { images: true, packagingSpec: true },
    });

    res.status(201).json({
      success: true,
      message: 'Product listed successfully with SafeTransit™ certification.',
      product,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Add Review for Product
 */
router.post('/:id/reviews', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, headline, comment, artisanPraise } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5 stars.' });
    }

    const review = await prisma.review.create({
      data: {
        productId: id,
        userId: req.user.id,
        rating: parseInt(rating, 10),
        headline,
        comment: comment || '',
        artisanPraise: artisanPraise || null,
        verifiedPurchase: true,
      },
    });

    res.status(201).json({ success: true, message: 'Review submitted. Thank you for supporting our artisans!', review });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
