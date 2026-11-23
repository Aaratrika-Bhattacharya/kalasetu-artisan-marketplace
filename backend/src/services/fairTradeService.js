const config = require('../config');

/**
 * Fair-Trade Transparency Ledger & Realization Engine
 */
class FairTradeService {
  /**
   * Calculate detailed breakdown of every rupee in an order
   */
  calculateBreakdown(grossRetailPrice, options = {}) {
    const customArtisanPct = options.artisanSharePct || config.ARTISAN_SHARE_DEFAULT_PCT;
    
    const artisanDirectPay = Math.round(grossRetailPrice * customArtisanPct);
    const platformTechFee = Math.round(grossRetailPrice * config.PLATFORM_TECH_FEE_PCT);
    const breakageReservePool = Math.round(grossRetailPrice * config.SAFE_TRANSIT_POOL_PCT);
    const packagingReserve = Math.round(grossRetailPrice * config.PACKAGING_RESERVE_PCT);
    
    // Balance adjustment
    const totalAllocated = artisanDirectPay + platformTechFee + breakageReservePool + packagingReserve;
    const diff = grossRetailPrice - totalAllocated;
    const finalArtisanPay = artisanDirectPay + diff;

    // Commercial Comparison: Traditional retail markup takes 75-82%, giving artisan only ~18%
    const commercialMiddlemanMarkup = Math.round(grossRetailPrice * 0.72);
    const commercialArtisanReceived = Math.round(grossRetailPrice * 0.18);
    const additionalArtisanBenefit = finalArtisanPay - commercialArtisanReceived;

    return {
      grossRetail: grossRetailPrice,
      artisanDirectPay: finalArtisanPay,
      artisanSharePct: Math.round((finalArtisanPay / grossRetailPrice) * 100),
      platformTechFee,
      platformFeePct: Math.round((platformTechFee / grossRetailPrice) * 100),
      breakageReservePool,
      packagingReserve,
      comparison: {
        commercialMiddlemanMarkup,
        commercialArtisanReceived,
        additionalArtisanBenefit,
        earningsMultiplier: (finalArtisanPay / Math.max(1, commercialArtisanReceived)).toFixed(1),
      },
    };
  }

  /**
   * Calculate aggregate impact stats for a cluster
   */
  calculateClusterImpact(artisanHourlyBase = 15.0, unitsSold = 100, grossGmv = 85000) {
    const directToArtisan = Math.round(grossGmv * 0.85);
    const traditionalEarning = Math.round(grossGmv * 0.18);
    const extraFamilyWealth = directToArtisan - traditionalEarning;
    
    // Effective new hourly realization
    const estimatedHours = unitsSold * 4.5;
    const newHourlyRealization = (directToArtisan / Math.max(1, estimatedHours)).toFixed(2);

    return {
      directToArtisan,
      traditionalEarning,
      extraFamilyWealth,
      baselineHourlyReturn: artisanHourlyBase,
      newHourlyRealization: parseFloat(newHourlyRealization),
      hourlyIncreaseMultiplier: (newHourlyRealization / Math.max(1, artisanHourlyBase)).toFixed(1),
    };
  }
}

module.exports = new FairTradeService();
