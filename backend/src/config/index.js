require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'kalasetu-secret-jwt-key-2026-traditional-crafts',
  JWT_EXPIRES_IN: '24h',
  JWT_REFRESH_EXPIRES_IN: '7d',
  
  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_kalasetu2026artisan',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'secret_test_signature_verification_key',
  
  // Gemini AI
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
  
  // Fair Trade Splits
  ARTISAN_SHARE_DEFAULT_PCT: 0.85,    // 85% directly to artisan
  PLATFORM_TECH_FEE_PCT: 0.08,        // 8% platform maintenance
  SAFE_TRANSIT_POOL_PCT: 0.04,        // 4% micro-insurance pool against breakage
  PACKAGING_RESERVE_PCT: 0.03,        // 3% bio-composite straw insert reserve
};
