const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const clusterRoutes = require('./routes/clusterRoutes');
const artisanRoutes = require('./routes/artisanRoutes');
const productRoutes = require('./routes/productRoutes');
const aiRoutes = require('./routes/aiRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const commissionRoutes = require('./routes/commissionRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API Routes Mounted under /api/v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clusters', clusterRoutes);
app.use('/api/v1/artisans', artisanRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/commissions', commissionRoutes);
app.use('/api/v1/logistics', logisticsRoutes);
app.use('/api/v1/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'KalaSetu Indian Artisan Marketplace Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    modules: [
      'Customer Marketplace',
      'Artisan Vernacular Studio (Bengali, Hindi, Gujarati, English)',
      'Admin Verification & Governance',
      'Gemini Multimodal Vision & Audio Intake',
      'SafeTransit™ Bio-Composite Zero-Breakage Logistics',
      'Razorpay HMAC-SHA256 Payment Engine',
      'Fair-Trade Transparency Ledger',
      'Custom Bespoke Sculpting Escrow',
    ],
  });
});

// Serve compiled React Frontend SPA from dist
const clientDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Central error handler
app.use(errorHandler);

// Start Server
if (require.main === module) {
  const PORT = config.PORT;
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🏺 KalaSetu (कला सेतु) Artisan Marketplace API Online`);
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`📋 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
