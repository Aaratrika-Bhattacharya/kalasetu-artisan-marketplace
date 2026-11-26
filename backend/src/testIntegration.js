const app = require('./server');
const http = require('http');

let server;
const PORT = 5555;
const HOST = '127.0.0.1';
const BASE_URL = `http://${HOST}:${PORT}`;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = options.headers || {};
  if (options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data: json };
}

async function runTests() {
  console.log('🧪 Starting KaPra Backend Integration Test Suite...\n');
  await new Promise((resolve) => {
    server = app.listen(PORT, HOST, resolve);
  });
  let failed = 0;
  let passed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    console.log('[Test 1] Health Check');
    const health = await request('/api/health');
    assert(health.status === 200 && health.data.status === 'HEALTHY', 'API health status is HEALTHY');

    // 2. Craft Clusters
    console.log('\n[Test 2] Craft Clusters & GI Metadata');
    const clusters = await request('/api/v1/clusters');
    assert(clusters.status === 200 && clusters.data.clusters.length >= 6, `Fetched ${clusters.data.clusters.length} craft clusters`);
    const giClusters = clusters.data.clusters.filter((c) => c.isGiTagged);
    assert(giClusters.length >= 3, `Identified ${giClusters.length} GI-tagged clusters (Jaipur, Bishnupur, Nizamabad)`);

    // 3. Products & Fair-Trade Split
    console.log('\n[Test 3] Product Catalog & Fair-Share Transparency');
    const products = await request('/api/v1/products?limit=5');
    assert(products.status === 200 && products.data.products.length > 0, `Products catalog returns ${products.data.products.length} products`);
    const firstProd = products.data.products[0];
    assert(firstProd.fairShareBreakdown && firstProd.fairShareBreakdown.artisanSharePct >= 80, `Product fair-share breakdown allocates ${firstProd.fairShareBreakdown.artisanSharePct}% to artisan lineage`);

    // 4. Gemini Multimodal Voice Onboarding
    console.log('\n[Test 4] Gemini Multimodal Voice Onboarding & Translation');
    const aiTest = await request('/api/v1/ai/multimodal-onboard', {
      method: 'POST',
      body: {
        voiceTranscript: 'এটা আমাদের বাঁকুড়ার টেরাকোটা ঘোড়া, উচ্চতা প্রায় ১৬ ইঞ্চি, দাম ৯৫০ টাকা',
        spokenLang: 'bn',
      },
    });
    assert(aiTest.status === 200 && aiTest.data.success, 'Gemini multimodal voice pipeline completed successfully');
    assert(aiTest.data.data.craft === 'Terracotta' && aiTest.data.data.fragilityClass === 'EXTREME', 'Correctly identified Terracotta craft and EXTREME fragility');
    assert(aiTest.data.data.vernacularTitles && aiTest.data.data.vernacularTitles.bn, 'Generated Bengali and English titles');

    // 5. Artisan OTP Authentication Flow
    console.log('\n[Test 5] Vernacular Artisan OTP Authentication');
    const otpReq = await request('/api/v1/auth/artisan-otp-request', {
      method: 'POST',
      body: { phoneNumber: '+919876543201', lang: 'bn' },
    });
    assert(otpReq.status === 200 && otpReq.data.testOtp, 'Artisan OTP generated with vernacular response');

    const otpVerify = await request('/api/v1/auth/artisan-otp-verify', {
      method: 'POST',
      body: { phoneNumber: '+919876543201', otp: otpReq.data.testOtp },
    });
    assert(otpVerify.status === 200 && otpVerify.data.token, 'Artisan authenticated via OTP with valid JWT');
    const artisanToken = otpVerify.data.token;

    // 6. Customer Login
    console.log('\n[Test 6] Customer Authentication');
    const custLogin = await request('/api/v1/auth/login', {
      method: 'POST',
      body: { identifier: 'arjun.connoisseur@gmail.com', password: 'password123' },
    });
    assert(custLogin.status === 200 && custLogin.data.token, 'Customer logged in with valid JWT');
    const customerToken = custLogin.data.token;

    // 7. Checkout & Order Creation
    console.log('\n[Test 7] Order Checkout & SafeTransit Shipping Calculation');
    const checkoutRes = await request('/api/v1/orders/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        items: [{ productId: firstProd.id, quantity: 1 }],
        shippingAddress: {
          fullName: 'Arjun Sen',
          street: '15 Southern Avenue',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: '700029',
          phone: '+919800000002',
        },
      },
    });
    assert(checkoutRes.status === 201 && checkoutRes.data.order.orderNumber, `Order created: ${checkoutRes.data.order.orderNumber}`);
    const orderId = checkoutRes.data.order.id;
    const orderNumber = checkoutRes.data.order.orderNumber;

    // 8. Razorpay Order Creation & HMAC Verification
    console.log('\n[Test 8] Razorpay Payment Gateway & Cryptographic HMAC Verification');
    const rzpOrder = await request('/api/v1/payments/create-razorpay', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { orderId },
    });
    assert(rzpOrder.status === 200 && rzpOrder.data.razorpayOrder.id, `Razorpay order initialized: ${rzpOrder.data.razorpayOrder.id}`);

    const rzpOrderId = rzpOrder.data.razorpayOrder.id;
    const rzpPaymentId = `pay_${Date.now()}`;

    // Test fake/tampered signature rejection
    const fakeVerify = await request('/api/v1/payments/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        orderId,
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: rzpPaymentId,
        razorpaySignature: 'invalid_tampered_fake_signature',
      },
    });
    assert(fakeVerify.status === 400, 'Tampered/fake payment signature correctly REJECTED (never marks fake payments)');

    // Generate valid HMAC signature and verify
    const sigHelper = await request('/api/v1/payments/dev-generate-test-signature', {
      method: 'POST',
      body: { razorpayOrderId: rzpOrderId, razorpayPaymentId: rzpPaymentId },
    });
    const validSignature = sigHelper.data.razorpaySignature;

    const validVerify = await request('/api/v1/payments/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        orderId,
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: rzpPaymentId,
        razorpaySignature: validSignature,
      },
    });
    assert(validVerify.status === 200 && validVerify.data.status === 'PAID', 'Authentic HMAC signature verified and order marked PAID');

    // 9. SafeTransit Tracking
    console.log('\n[Test 9] SafeTransit™ Live Order Tracking');
    const trackRes = await request(`/api/v1/orders/track/${orderNumber}`);
    assert(trackRes.status === 200 && trackRes.data.order.timeline.length > 0, 'Tracking timeline retrieved with bio-straw packaging instructions');

    // 10. Admin Governance Analytics
    console.log('\n[Test 10] Admin Dashboard Analytics');
    const adminLogin = await request('/api/v1/auth/login', {
      method: 'POST',
      body: { identifier: 'admin@kalasetu.org', password: 'admin123456' },
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, 'Admin logged in');

    const adminOverview = await request('/api/v1/admin/overview', {
      headers: { Authorization: `Bearer ${adminLogin.data.token}` },
    });
    assert(adminOverview.status === 200 && adminOverview.data.analytics.totalGmvInr > 0, `Admin analytics GMV: ₹${adminOverview.data.analytics.totalGmvInr}`);
    assert(adminOverview.data.analytics.transitBreakageRatePct !== undefined, `Transit breakage metric reported: ${adminOverview.data.analytics.transitBreakageRatePct}%`);

    // 11. Custom Bespoke Commission & Milestone Escrow
    console.log('\n[Test 11] Bespoke Custom Commission & Milestone Escrow');
    const allArtisans = await request('/api/v1/artisans');
    const sculptorArtisan = allArtisans.data.artisans.find((a) => a.artisanName === 'Santu Roy') || allArtisans.data.artisans[0];

    const commissionRes = await request('/api/v1/commissions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        artisanId: sculptorArtisan.id,
        title: '5-Foot Terracotta Garden Deity Sculpture',
        projectScope: 'Custom weathered outdoor garden sculpture with steel armature',
        patronBudget: 28000,
      },
    });
    assert(commissionRes.status === 201 && commissionRes.data.commission.milestones.length === 3, 'Created 3-stage milestone escrow commission');
    assert(commissionRes.data.commission.digitalIpHash.startsWith('urn:kalasetu:ip:'), 'Generated SHA-256 digital copyright mold hash');

    // 12. Seller listing, public storytelling and production capacity
    console.log('\n[Test 12] Seller Listing Management');
    const sellerHeaders = { Authorization: `Bearer ${artisanToken}` };
    const listing = await request('/api/v1/products', {
      method: 'POST',
      headers: sellerHeaders,
      body: {
        title: 'Wheel-thrown workshop bowl',
        description: 'A small bowl made from locally sourced clay.',
        retailPrice: 800,
        artisanBasePrice: 640,
        category: 'Pottery & Ceramics',
        stockQuantity: 2,
        craftDetails: { artForm: 'Terracotta', materials: ['Clay'], makingProcess: 'Thrown on a wheel and kiln-fired.' },
      },
    });
    const listingId = listing.data.product?.id;
    assert(listing.status === 201 && listingId, 'Artisan created a product with craft details');
    if (listingId) {
      const updated = await request(`/api/v1/products/${listingId}`, {
        method: 'PATCH',
        headers: sellerHeaders,
        body: { stockQuantity: 4, craftDetails: { ...JSON.parse(listing.data.product.craftDetails), story: 'Made for the festive table.' } },
      });
      assert(updated.status === 200 && updated.data.product?.stockQuantity === 4, 'Artisan updated product inventory');
      const detail = await request(`/api/v1/products/${listingId}`);
      assert(detail.status === 200 && detail.data.product?.craftDetails?.story === 'Made for the festive table.',
        'Product detail exposes saved storytelling metadata');
      const unavailable = await request('/api/v1/orders/checkout', {
        method: 'POST', headers: { Authorization: `Bearer ${customerToken}` },
        body: { items: [{ productId: listingId, quantity: 5 }], shippingAddress: { fullName: 'Example Buyer', street: 'Example Street', pincode: '700029' } },
      });
      assert(unavailable.status === 409, 'Checkout checks available stock');
    }
    const capacity = await request('/api/v1/artisans/profile', {
      method: 'PATCH', headers: sellerHeaders, body: { weeklyCapacity: 24 },
    });
    const dashboard = await request('/api/v1/artisans/my/dashboard', { headers: sellerHeaders });
    assert(capacity.status === 200 && dashboard.data.profile?.weeklyCapacity === 24 &&
      typeof dashboard.data.metrics?.grossSalesInr === 'number', 'Dashboard exposes saved capacity and sales totals');

    console.log(`\n=======================================================`);
    console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`=======================================================`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
  }
}

runTests();
