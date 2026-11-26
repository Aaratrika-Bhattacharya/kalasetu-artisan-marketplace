const express = require('express');
const { randomUUID } = require('node:crypto');
const router = express.Router();
const prisma = require('../prismaClient');
const { authenticate, requireRole, optionalAuth } = require('../middleware/auth');
const logisticsService = require('../services/logisticsService');
const fairTradeService = require('../services/fairTradeService');
const { readCraftDetails, writeCraftDetails, mediaUrl } = require('../services/productDetails');

async function getPackagingFields(cluster, listing, details) {
  const assessment = logisticsService.assessFragility({
    craftType: details?.artForm || cluster.name,
    category: listing.category,
    dimensions: {
      lengthCm: listing.lengthCm, widthCm: listing.widthCm,
      heightCm: listing.heightCm, weightGrams: listing.weightGrams,
    },
    materials: details?.materials?.length ? details.materials : JSON.parse(cluster.materialsUsed || '[]'),
  });
  const spec = await prisma.fragilitySpec.upsert({
    where: { code: assessment.packagingCode },
    update: {},
    create: {
      code: assessment.packagingCode,
      name: assessment.packagingCode.replace(/_/g, ' '),
      fragilityClass: assessment.fragilityClass,
      packagingInstructions: JSON.stringify(assessment.packagingInstructions),
      cushioningMaterial: 'Bio-Composite Shock Cushioning',
      dropTestRatingFeet: assessment.dropRatingFeet,
      boxCostInr: assessment.boxCostInr,
    },
  });
  return { fragilityClass: assessment.fragilityClass, packagingTypeId: spec.id };
}

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
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
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
        craftDetails: readCraftDetails(p.craftDetails),
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
          district: p.cluster.district,
          description: p.cluster.description,
          isGiTagged: p.cluster.isGiTagged,
          giRegNumber: p.cluster.giRegNumber,
          materialsUsed: JSON.parse(p.cluster.materialsUsed || '[]'),
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
        status: 'ACTIVE',
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
        craftDetails: readCraftDetails(product.craftDetails),
        dimensions: { lengthCm: product.lengthCm, widthCm: product.widthCm, heightCm: product.heightCm, weightGrams: product.weightGrams },
        artisan: {
          id: product.artisan.id,
          artisanName: product.artisan.user.fullName,
          avatarUrl: product.artisan.user.avatarUrl,
          brandName: product.artisan.brandName,
          artisanLineage: product.artisan.artisanLineage,
        },
        cluster: { ...product.cluster, materialsUsed: JSON.parse(product.cluster.materialsUsed || '[]') },
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
      craftDetails,
    } = req.body;

    const profile = await prisma.artisanProfile.findUnique({
      where: { userId: req.user.id },
      include: { cluster: true },
    });

    if (!profile) {
      return res.status(403).json({ success: false, error: 'Only registered artisans can list products.' });
    }

    const listing = validateListing({ title, description, category: category || 'Home Decor',
      retailPrice, artisanBasePrice: artisanBasePrice ?? Math.round(Number(retailPrice) * 0.85),
      stockQuantity, leadTimeDays, lengthCm, widthCm, heightCm, weightGrams, imageUrls, craftDetails });
    if (typeof isMadeToOrder !== 'boolean') return res.status(400).json({ error: 'Invalid made-to-order flag.' });

    const packaging = await getPackagingFields(profile.cluster, listing, readCraftDetails(listing.craftDetails));

    // Generate unique slug
    const cleanSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const slug = `${cleanSlug || 'craft'}-${randomUUID().slice(0, 8)}`;

    const numRetail = listing.retailPrice;

    const product = await prisma.product.create({
      data: {
        artisanId: profile.id,
        clusterId: profile.clusterId,
        ...listing,
        ...packaging,
        safeTransitCertified: true,
        slug,
        vernacularTitles: vernacularTitles ? JSON.stringify(vernacularTitles) : null,
        vernacularDescs: vernacularDescs ? JSON.stringify(vernacularDescs) : null,
        subCategory,
        tags: JSON.stringify(Array.isArray(tags) ? tags : [tags]),
        marketBenchmarkPrice: marketBenchmarkPrice ? parseFloat(marketBenchmarkPrice) : Math.round(numRetail * 1.6),
        isMadeToOrder,
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

function validateListing(input) {
  const listing = {};
  for (const key of ['title', 'description', 'category']) {
    if (typeof input[key] !== 'string' || !input[key].trim()) {
      throw Object.assign(new Error(`${key} is required.`), { statusCode: 400 });
    }
    listing[key] = input[key].trim();
  }
  for (const key of ['retailPrice', 'artisanBasePrice', 'stockQuantity', 'leadTimeDays', 'lengthCm', 'widthCm', 'heightCm', 'weightGrams']) {
    const raw = input[key];
    const value = (typeof raw === 'number' || (typeof raw === 'string' && raw.trim())) ? Number(raw) : NaN;
    const integer = key === 'stockQuantity' || key === 'leadTimeDays';
    const allowZero = integer || key === 'artisanBasePrice';
    if (!Number.isFinite(value) || value < 0 || (!allowZero && value === 0) ||
        (integer && (!Number.isInteger(value) || value > 2147483647))) {
      throw Object.assign(new Error(`Invalid ${key}.`), { statusCode: 400 });
    }
    listing[key] = value;
  }
  if (listing.artisanBasePrice > listing.retailPrice) {
    throw Object.assign(new Error('Artisan earnings cannot exceed the retail price.'), { statusCode: 400 });
  }
  if (input.imageUrls !== undefined &&
      (!Array.isArray(input.imageUrls) || input.imageUrls.length > 10 || !input.imageUrls.every(mediaUrl))) {
    throw Object.assign(new Error('Use up to 10 uploaded images or HTTP(S) image URLs.'), { statusCode: 400 });
  }
  listing.craftDetails = writeCraftDetails(input.craftDetails);
  return listing;
}

router.patch('/:id', authenticate, requireRole(['ARTISAN']), async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, artisan: { userId: req.user.id } },
      include: { cluster: true },
    });
    if (!product) return res.status(404).json({ error: 'Listing not found.' });

    const { imageUrls, craftDetails, isMadeToOrder = product.isMadeToOrder } = req.body;
    const priorDetails = readCraftDetails(product.craftDetails);
    const mergedDetails = craftDetails && typeof craftDetails === 'object' && !Array.isArray(craftDetails)
      ? { ...priorDetails, ...craftDetails }
      : craftDetails;
    if (typeof isMadeToOrder !== 'boolean') return res.status(400).json({ error: 'Invalid made-to-order flag.' });
    const data = validateListing({ ...product, ...req.body, craftDetails: mergedDetails });
    const nextDetails = readCraftDetails(data.craftDetails ?? product.craftDetails);
    const packagingChanged = ['category', 'lengthCm', 'widthCm', 'heightCm', 'weightGrams']
      .some((key) => data[key] !== product[key]) ||
      priorDetails?.artForm !== nextDetails?.artForm ||
      JSON.stringify(priorDetails?.materials || []) !== JSON.stringify(nextDetails?.materials || []);
    const packaging = packagingChanged ? await getPackagingFields(product.cluster, data, nextDetails) : {};
    const updated = await prisma.product.update({
      where: { id: product.id, updatedAt: product.updatedAt },
      data: {
        ...data,
        ...packaging,
        isMadeToOrder,
        images: imageUrls === undefined ? undefined : {
          deleteMany: {},
          create: imageUrls.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder, isPrimary: sortOrder === 0 })),
        },
      },
      include: { images: true },
    });
    res.json({ success: true, product: updated });
  } catch (err) {
    if (err.code === 'P2025') return res.status(409).json({ error: 'This listing changed. Refresh and try again.' });
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
