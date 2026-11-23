const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

/**
 * List all craft clusters with GI metadata
 */
router.get('/', async (req, res, next) => {
  try {
    const clusters = await prisma.craftCluster.findMany({
      include: {
        _count: {
          select: { artisans: true, products: true },
        },
      },
    });

    const formatted = clusters.map((c) => ({
      ...c,
      materialsUsed: JSON.parse(c.materialsUsed || '[]'),
      artisansCount: c._count.artisans,
      productsCount: c._count.products,
    }));

    res.json({ success: true, count: formatted.length, clusters: formatted });
  } catch (err) {
    next(err);
  }
});

/**
 * Get cluster by slug or id
 */
router.get('/:slugOrId', async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    const cluster = await prisma.craftCluster.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
      },
      include: {
        artisans: {
          include: {
            user: { select: { fullName: true, avatarUrl: true } },
            _count: { select: { products: true } },
          },
        },
        products: {
          where: { status: 'ACTIVE' },
          include: { images: true },
        },
      },
    });

    if (!cluster) {
      return res.status(404).json({ success: false, error: 'Craft cluster not found.' });
    }

    res.json({
      success: true,
      cluster: {
        ...cluster,
        materialsUsed: JSON.parse(cluster.materialsUsed || '[]'),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
