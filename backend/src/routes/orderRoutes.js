const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const logisticsService = require('../services/logisticsService');
const fairTradeService = require('../services/fairTradeService');
const { authenticate, optionalAuth } = require('../middleware/auth');

/**
 * Checkout and Create Order
 */
router.post('/checkout', authenticate, async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ success: false, error: 'Cart is empty. Provide items to checkout.' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.pincode) {
      return res.status(400).json({ success: false, error: 'Complete shipping address is required.' });
    }

    const quantities = new Map();
    for (const item of items) {
      const raw = item?.quantity ?? 1;
      const quantity = typeof raw === 'number' || (typeof raw === 'string' && /^\d+$/.test(raw)) ? Number(raw) : NaN;
      const total = (quantities.get(item?.productId) || 0) + quantity;
      if (typeof item?.productId !== 'string' || !Number.isSafeInteger(quantity) || quantity < 1 || total > 2147483647) {
        return res.status(400).json({ success: false, error: 'Each item requires a product and a positive whole quantity.' });
      }
      quantities.set(item.productId, total);
    }

    const productIds = [...quantities.keys()];
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, status: 'ACTIVE' },
      include: { packagingSpec: true },
    });

    if (dbProducts.length !== productIds.length) {
      return res.status(400).json({ success: false, error: 'One or more products in your cart are no longer available.' });
    }

    let grossItemsTotal = 0;
    let artisanShareTotal = 0;
    let maxFragility = 'LOW';
    let totalWeight = 0;

    const orderItemsData = [];

    for (const prod of dbProducts) {
      const qty = quantities.get(prod.id);
      if (!prod.isMadeToOrder && qty > prod.stockQuantity) {
        return res.status(409).json({ success: false, error: `Only ${prod.stockQuantity} available for ${prod.title}.` });
      }
      const lineTotal = prod.retailPrice * qty;
      const artisanLineShare = prod.artisanBasePrice * qty;

      grossItemsTotal += lineTotal;
      artisanShareTotal += artisanLineShare;
      totalWeight += (prod.weightGrams || 800) * qty;

      if (prod.fragilityClass === 'EXTREME') maxFragility = 'EXTREME';
      else if (prod.fragilityClass === 'HIGH' && maxFragility !== 'EXTREME') maxFragility = 'HIGH';
      else if (prod.fragilityClass === 'MEDIUM' && !['EXTREME', 'HIGH'].includes(maxFragility)) maxFragility = 'MEDIUM';

      orderItemsData.push({
        productId: prod.id,
        artisanId: prod.artisanId,
        quantity: qty,
        unitPrice: prod.retailPrice,
        artisanUnitShare: prod.artisanBasePrice,
        subtotal: lineTotal,
        packagingStatus: 'PENDING',
      });
    }

    // Calculate SafeTransit shipping
    const shipping = logisticsService.calculateShipping({
      lengthCm: 25,
      widthCm: 25,
      heightCm: 30,
      weightGrams: totalWeight,
      destPincode: shippingAddress.pincode,
      fragilityClass: maxFragility,
    });

    const platformFee = Math.round(grossItemsTotal * 0.08);
    const grandTotal = grossItemsTotal + shipping.totalShippingFee;

    // Generate Order Number
    const orderNumber = `KS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: req.user.id,
        totalAmount: grandTotal,
        artisanShareTotal,
        platformFeeTotal: platformFee,
        packagingFeeTotal: shipping.packagingFee,
        shippingFeeTotal: shipping.totalShippingFee,
        shippingAddress: JSON.stringify(shippingAddress),
        status: 'PENDING_PAYMENT',
        safeTransitGuarantee: true,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Ready for payment.',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        grossItemsTotal,
        artisanShareTotal,
        shippingFee: shipping.totalShippingFee,
        fragilityClass: maxFragility,
        safeTransitGuarantee: order.safeTransitGuarantee,
        itemsCount: order.items.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Get Customer's Orders
 */
router.get('/my-orders', authenticate, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user.id },
      include: {
        items: { include: { product: { include: { images: true } } } },
        payment: true,
        shipment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      count: orders.length,
      orders: orders.map((o) => ({
        ...o,
        shippingAddress: JSON.parse(o.shippingAddress || '{}'),
        trackingTimeline: o.shipment ? JSON.parse(o.shipment.trackingTimeline || '[]') : [],
      })),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Public Order Tracking & Fragile Inspection Guide
 */
router.get('/track/:orderNumber', async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        shipment: true,
        items: {
          include: {
            product: {
              include: { images: true, packagingSpec: true, cluster: true },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found with provided tracking number.' });
    }

    const trackingSteps = order.shipment
      ? JSON.parse(order.shipment.trackingTimeline || '[]')
      : logisticsService.generateTrackingTimeline({ orderNumber });

    res.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        safeTransitGuarantee: order.safeTransitGuarantee,
        carrierName: order.shipment ? order.shipment.carrierName : 'SafeTransit Fragile Express',
        trackingNumber: order.shipment ? order.shipment.trackingNumber : `ST-${order.orderNumber.replace('KS-', '')}`,
        timeline: trackingSteps,
        items: order.items.map((i) => ({
          title: i.product.title,
          quantity: i.quantity,
          fragilityClass: i.product.fragilityClass,
          packagingType: i.product.packagingSpec ? i.product.packagingSpec.name : 'Bio-Composite Straw Packaging',
          packagingInstructions: i.product.packagingSpec
            ? JSON.parse(i.product.packagingSpec.packagingInstructions || '[]')
            : [],
          image: i.product.images[0] ? i.product.images[0].imageUrl : null,
          craft: i.product.cluster.name,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Report Transit Breakage (SafeTransit™ Zero-Deductible Guarantee)
 */
router.post('/:id/breakage-claim', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { itemId, description, photoUrl } = req.body;

    const orderItem = await prisma.orderItem.findFirst({
      where: { id: itemId, orderId: id },
      include: { product: true },
    });

    if (!orderItem) {
      return res.status(404).json({ success: false, error: 'Order item not found.' });
    }

    await prisma.orderItem.update({
      where: { id: orderItem.id },
      data: { breakageClaimed: true },
    });

    res.json({
      success: true,
      message: 'Transit breakage claim registered under SafeTransit™ Mutual Reserve Pool.',
      resolution: 'Free artisan replacement dispatched within 48 hours at zero cost to customer and artisan.',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
