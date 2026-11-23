const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const prisma = require('../prismaClient');
const { authenticate } = require('../middleware/auth');

/**
 * Multimodal Product Onboarding: Audio Voice Memo + Image analysis
 * Translates Bengali, Hindi, Gujarati to English and structures catalog data
 */
router.post('/multimodal-onboard', async (req, res, next) => {
  try {
    const { voiceTranscript, spokenLang = 'hi', imageMeta = {} } = req.body;

    if (!voiceTranscript) {
      return res.status(400).json({
        success: false,
        error: 'voiceTranscript is required. Please provide spoken craft details.',
      });
    }

    const aiResult = await geminiService.processMultimodalOnboarding({
      voiceTranscript,
      spokenLang,
      imageMeta,
    });

    res.json({
      success: true,
      message: 'Product details generated successfully using Gemini Multimodal AI.',
      data: aiResult,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Recommend Product Categories & Tags
 */
router.post('/recommend-tags', async (req, res, next) => {
  try {
    const { title, craftType, description } = req.body;

    const query = `${title || ''} ${craftType || ''} ${description || ''}`;
    const result = await geminiService.processMultimodalOnboarding({
      voiceTranscript: query,
      spokenLang: 'en',
    });

    res.json({
      success: true,
      category: result.category,
      tags: result.tags,
      suggestedPrice: result.suggestedRetailPrice,
      fragilityClass: result.fragilityClass,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * AI-Powered Natural Language Product Discovery
 */
router.get('/semantic-search', async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, error: 'Query parameter q is required.' });
    }

    const allProducts = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        images: true,
        cluster: true,
        artisan: { include: { user: true } },
      },
    });

    const matches = await geminiService.semanticSearch(q, allProducts);

    res.json({
      success: true,
      query: q,
      count: matches.length,
      products: matches.slice(0, 10),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
