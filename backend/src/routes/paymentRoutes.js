const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const razorpayService = require('../services/razorpayService');
const logisticsService = require('../services/logisticsService');
const fairTradeService = require('../services/fairTradeService');
const { authenticate } = require('../middleware/auth');

/**
 * Initialize Razorpay Order
 */
router.post('/create-razorpay', authenticate, async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    if (order.status === 'PAID') {
      return res.status(400).json({ success: false, error: 'This order is already paid.' });
    }

    // Call Razorpay Order generation
    const rzpOrder = await razorpayService.createOrder({
      amountInInr: order.totalAmount,
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        customerId: order.customerId,
        safeTransitGuaranteed: 'true',
      },
    });

    // Save/Update PaymentTransaction
    await prisma.paymentTransaction.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        razorpayOrderId: rzpOrder.id,
        amount: order.totalAmount,
        currency: 'INR',
        status: 'CREATED',
      },
      update: {
        razorpayOrderId: rzpOrder.id,
        amount: order.totalAmount,
        status: 'CREATED',
      },
    });

    res.json({
      success: true,
      razorpayOrder: rzpOrder,
      keyId: razorpayService.keyId,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Verify Razorpay Cryptographic Signature (HMAC-SHA256)
 */
router.post('/verify', authenticate, async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        error: 'Missing Razorpay verification parameters: order ID, payment ID, or signature.',
      });
    }

    // Strict HMAC-SHA256 verification
    const isValid = razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      console.warn(`[Payment Fraud Alert] Signature mismatch for order: ${orderId}`);
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed: Cryptographic HMAC signature does not match.',
      });
    }

    // Signature verified! Transition order state
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Associated order not found.' });
    }

    // Update payment record
    await prisma.paymentTransaction.update({
      where: { orderId: order.id },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        status: 'CAPTURED',
        paymentMethod: req.body.paymentMethod || 'UPI/Card',
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAID' },
    });

    // Create Initial SafeTransit Shipment Record
    const trackingSteps = logisticsService.generateTrackingTimeline({
      orderNumber: order.orderNumber,
    });

    await prisma.shipmentRecord.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        trackingNumber: `ST-${order.orderNumber.replace('KS-', '')}`,
        carrierName: 'SafeTransit Fragile Express',
        shippingStatus: 'PAID_PREPARING_BIO_STRAW',
        fragilityHandling: true,
        originPincode: '722122',
        destPincode: '110001',
        trackingTimeline: JSON.stringify(trackingSteps),
      },
      update: {
        shippingStatus: 'PAID_PREPARING_BIO_STRAW',
      },
    });

    // Generate Fair-Trade Audit Logs for each artisan in order
    for (const item of order.items) {
      await prisma.fairTradeAuditLog.create({
        data: {
          orderId: order.id,
          artisanId: item.artisanId,
          grossRetail: item.subtotal,
          artisanDirectPay: item.artisanUnitShare * item.quantity,
          packagingReserve: Math.round(item.subtotal * 0.03),
          breakagePoolReserve: Math.round(item.subtotal * 0.04),
          platformTechFee: Math.round(item.subtotal * 0.08),
        },
      });
    }

    res.json({
      success: true,
      message: 'Payment verified and captured successfully via HMAC-SHA256 signature.',
      orderNumber: order.orderNumber,
      status: 'PAID',
      safeTransitGuaranteeActive: true,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Dev-only test helper to calculate signature for automated test verification
 */
router.post('/dev-generate-test-signature', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not available in production' });
  }

  const { razorpayOrderId, razorpayPaymentId } = req.body;
  const signature = razorpayService.generateTestSignature(razorpayOrderId, razorpayPaymentId);
  res.json({ success: true, razorpaySignature: signature });
});

module.exports = router;
