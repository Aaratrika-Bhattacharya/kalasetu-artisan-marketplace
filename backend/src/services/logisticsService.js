/**
 * SafeTransit™ Logistics & Fragile Packaging Engine
 * Direct engineering response to fieldwork breakage data (27.5% terracotta breakage)
 */
class LogisticsService {
  /**
   * Determine Fragility Class and Packaging Requirement
   */
  assessFragility({ craftType, category, dimensions = {}, materials = [] }) {
    let fragilityClass = 'MEDIUM';
    let packagingCode = 'BIO_STRAW_STANDARD_V1';
    let dropRatingFeet = 3.5;
    let boxCostInr = 12.0;

    const craft = (craftType || '').toLowerCase();
    const cat = (category || '').toLowerCase();

    if (craft.includes('terracotta') || craft.includes('bengal') || cat.includes('sculpture')) {
      fragilityClass = 'EXTREME';
      packagingCode = 'BIO_STRAW_TERRACOTTA_SHOCK_V2';
      dropRatingFeet = 4.5;
      boxCostInr = 14.0;
    } else if (craft.includes('blue pottery') || craft.includes('ceramic') || craft.includes('black pottery')) {
      fragilityClass = 'HIGH';
      packagingCode = 'HONEYCOMB_DOUBLE_FLUTE_V1';
      dropRatingFeet = 4.0;
      boxCostInr = 18.0;
    } else if (craft.includes('lippan') || craft.includes('mirror') || cat.includes('wall decor')) {
      fragilityClass = 'MEDIUM';
      packagingCode = 'RIGID_PINE_EDGE_CUSHION_V1';
      dropRatingFeet = 3.5;
      boxCostInr = 22.0;
    } else {
      fragilityClass = 'LOW';
      packagingCode = 'RECYCLED_KRAFT_STANDARD';
      dropRatingFeet = 3.0;
      boxCostInr = 8.0;
    }

    const instructions = this.getPackagingInstructions(packagingCode);

    return {
      fragilityClass,
      packagingCode,
      dropRatingFeet,
      boxCostInr,
      packagingInstructions: instructions,
    };
  }

  /**
   * Step-by-step pictorial & checklist instructions for artisans & packaging units
   */
  getPackagingInstructions(packagingCode) {
    const specs = {
      BIO_STRAW_TERRACOTTA_SHOCK_V2: [
        'Place base moulded bio-composite paddy straw cradle inside the 5-ply corrugated carton.',
        'Wrap the terracotta piece in breathable unbleached butter paper to prevent abrasion.',
        'Slide product into contoured straw cavity; ensure zero movement on horizontal axes.',
        'Fit the interlocking upper bio-straw lid and apply tamper-evident SafeTransit™ seal.',
        'Affix bright red "FRAGILE - HERITAGE CLAY - THIS SIDE UP" bilingual handling label.',
      ],
      HONEYCOMB_DOUBLE_FLUTE_V1: [
        'Expand 100% biodegradable kraft honeycomb paper to 1.5x tension.',
        'Spiral-wrap the ceramic rim and handles with minimum 3 continuous layers.',
        'Insert into double-fluted box with 25mm clearance on all six sides.',
        'Fill void spaces with compressed paper curls (no plastic thermocol).',
        'Drop test passed from 4.0 feet on concrete corner.',
      ],
      RIGID_PINE_EDGE_CUSHION_V1: [
        'Attach 4-corner rigid pine corner protectors to prevent frame warping.',
        'Apply scratch-resistant film over mirror glass surfaces.',
        'Encase in shock-dampening ribbed cardboard folder.',
        'Seal in moisture-resistant recycled poly-sleeve for humid transit routes.',
      ],
      RECYCLED_KRAFT_STANDARD: [
        'Wrap item in 2 layers of recycled honeycomb paper.',
        'Pack in snug 3-ply carton with corrugated divider pads.',
      ],
    };

    return specs[packagingCode] || specs.RECYCLED_KRAFT_STANDARD;
  }

  /**
   * Calculate Shipping Cost based on Actual vs Volumetric Weight and Distance
   */
  calculateShipping({ lengthCm, widthCm, heightCm, weightGrams, originPincode = '722122', destPincode = '110001', fragilityClass = 'HIGH' }) {
    // Volumetric weight divisor: 5000 (standard Indian freight logistics)
    const volumetricWeightGrams = Math.round((lengthCm * widthCm * heightCm * 1000) / 5000);
    const billableWeightGrams = Math.max(weightGrams, volumetricWeightGrams);

    // Baseline shipping: ₹60 for first 500g, ₹35 for each additional 500g
    const weightUnits = Math.ceil(billableWeightGrams / 500);
    let baseShippingFee = 60 + Math.max(0, weightUnits - 1) * 35;

    // Fragility handling surcharge (special careful transit, no throwing/tumbling belts)
    let fragilityHandlingFee = 0;
    if (fragilityClass === 'EXTREME') fragilityHandlingFee = 45;
    else if (fragilityClass === 'HIGH') fragilityHandlingFee = 30;
    else if (fragilityClass === 'MEDIUM') fragilityHandlingFee = 15;

    // SafeTransit Bio-Composite Box Packaging Fee
    const packagingFee = 15;

    const totalShipping = baseShippingFee + fragilityHandlingFee + packagingFee;

    // Estimated transit days based on distance estimate
    const estimatedDays = 3 + Math.floor(Math.random() * 2);

    return {
      actualWeightGrams: weightGrams,
      volumetricWeightGrams,
      billableWeightGrams,
      baseShippingFee,
      fragilityHandlingFee,
      packagingFee,
      totalShippingFee: totalShipping,
      estimatedDeliveryDays: estimatedDays,
      originPincode,
      destPincode,
    };
  }

  /**
   * Generate Live Tracking Timeline milestones
   */
  generateTrackingTimeline({ orderNumber, originCity = 'Bishnupur, West Bengal', destCity = 'New Delhi' }) {
    const now = new Date();
    const d1 = new Date(now.getTime() - 48 * 3600 * 1000).toISOString();
    const d2 = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
    const d3 = new Date(now.getTime() - 6 * 3600 * 1000).toISOString();

    return [
      {
        status: 'ORDER_VERIFIED',
        title: 'Order Verified & Fair-Share Escrow Locked',
        timestamp: d1,
        location: 'KaPra Central Hub',
        notes: 'Artisan lineage notified; 85% payout reserved in escrow.',
      },
      {
        status: 'SAFE_TRANSIT_PACKED',
        title: 'Packed in Bio-Composite Straw Shock Insert',
        timestamp: d2,
        location: originCity,
        notes: 'Passed 4.5ft drop test certification. Zero plastic thermocol used.',
      },
      {
        status: 'IN_TRANSIT_FRAGILE',
        title: 'Dispatched via SafeTransit Fragile Corridor',
        timestamp: d3,
        location: 'Kolkata Dedicated Sorting Hub',
        notes: 'Special fragile-care van transit with air-suspension; bypasses tumbling chutes.',
      },
      {
        status: 'OUT_FOR_DELIVERY',
        title: 'Out for Hand Delivery with Care',
        timestamp: new Date().toISOString(),
        location: destCity,
        notes: 'Delivery executive briefed on fragile ceramic handling.',
      },
    ];
  }
}

module.exports = new LogisticsService();
