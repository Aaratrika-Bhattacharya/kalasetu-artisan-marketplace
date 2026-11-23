const express = require('express');
const router = express.Router();
const logisticsService = require('../services/logisticsService');
const prisma = require('../prismaClient');

/**
 * Calculate Shipping & SafeTransit Packaging
 */
router.post('/calculate-shipping', (req, res) => {
  const {
    lengthCm = 20,
    widthCm = 20,
    heightCm = 25,
    weightGrams = 850,
    originPincode = '722122',
    destPincode = '110001',
    fragilityClass = 'HIGH',
  } = req.body;

  const result = logisticsService.calculateShipping({
    lengthCm: parseFloat(lengthCm),
    widthCm: parseFloat(widthCm),
    heightCm: parseFloat(heightCm),
    weightGrams: parseFloat(weightGrams),
    originPincode,
    destPincode,
    fragilityClass,
  });

  res.json({ success: true, shipping: result });
});

/**
 * List all Fragility Packaging Specifications
 */
router.get('/specs', async (req, res, next) => {
  try {
    const specs = await prisma.fragilitySpec.findMany();
    const formatted = specs.map((s) => ({
      ...s,
      instructionsList: JSON.parse(s.packagingInstructions || '[]'),
    }));
    res.json({ success: true, specs: formatted });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
