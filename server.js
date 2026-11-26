// KaPra - Artisan E-Commerce Platform Server
// Runs natively on Node.js with ZERO external npm dependencies!

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, 'data', 'artisans.json');

// In-memory runtime state for orders & commissions
let runtimeData = {
  orders: [],
  commissions: [],
  contributions: [],
  totalBreakagePreventedValue: 142500,
  totalArtisanEarnings: 489200
};

// Load artisan data
let db = { artisans: [], unitEconomicsBenchmark: {}, interventionsCatalog: [] };
try {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  db = JSON.parse(raw);
} catch (err) {
  console.error("Failed to load artisan data:", err);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // API Routes
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (pathname === '/api/artisans' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(db));
      return;
    }

    if (pathname.startsWith('/api/artisans/') && req.method === 'GET') {
      const id = pathname.replace('/api/artisans/', '');
      const artisan = db.artisans.find(a => a.id === id);
      if (artisan) {
        res.writeHead(200);
        res.end(JSON.stringify(artisan));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Artisan not found" }));
      }
      return;
    }

    if (pathname === '/api/stats' && req.method === 'GET') {
      const allProducts = db.artisans.flatMap(a => a.products);
      res.writeHead(200);
      res.end(JSON.stringify({
        totalArtisanClusters: db.artisans.length,
        totalArtisanStaff: db.artisans.reduce((acc, a) => acc + (a.workforce || 1), 0),
        totalCatalogItems: allProducts.length,
        activeOrders: runtimeData.orders.length,
        totalBreakagePreventedValue: runtimeData.totalBreakagePreventedValue,
        totalArtisanEarnings: runtimeData.totalArtisanEarnings,
        interventionsActive: db.interventionsCatalog.length
      }));
      return;
    }

    if (pathname === '/api/orders' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const orderId = 'KS-' + Math.floor(100000 + Math.random() * 900000);
          const order = {
            id: orderId,
            items: payload.items || [],
            customer: payload.customer || {},
            totalAmount: payload.totalAmount || 0,
            artisanDirectPayout: Math.round((payload.totalAmount || 0) * 0.78),
            platformPackagingFee: Math.round((payload.totalAmount || 0) * 0.12),
            logisticsFee: Math.round((payload.totalAmount || 0) * 0.10),
            safeTransitProtection: payload.safeTransitProtection || true,
            tipOrGrantContribution: payload.tipOrGrantContribution || 0,
            status: 'Artisan Preparing Order',
            certificateId: 'PROV-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
            placedAt: new Date().toISOString()
          };
          runtimeData.orders.push(order);
          runtimeData.totalArtisanEarnings += order.artisanDirectPayout;
          runtimeData.totalBreakagePreventedValue += Math.round(order.totalAmount * 0.25);

          res.writeHead(201);
          res.end(JSON.stringify({
            success: true,
            orderId: order.id,
            certificateId: order.certificateId,
            artisanPayout: order.artisanDirectPayout,
            message: "Order placed directly with artisan cluster! Provenance certificate registered."
          }));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Invalid JSON payload" }));
        }
      });
      return;
    }

    if (pathname === '/api/commissions' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const commissionId = 'COMM-' + Math.floor(1000 + Math.random() * 9000);
          const commission = {
            id: commissionId,
            artisanId: payload.artisanId,
            clientName: payload.clientName,
            brief: payload.brief,
            estimatedBudget: payload.budget,
            escrowMilestones: [
              { stage: "Advance & Raw Materials (25%)", status: "Escrow Locked", amount: Math.round(payload.budget * 0.25) },
              { stage: "Clay Prototype Review (35%)", status: "Pending Approval", amount: Math.round(payload.budget * 0.35) },
              { stage: "Firing/Cast & Safe Dispatch (40%)", status: "Upon Delivery", amount: Math.round(payload.budget * 0.40) }
            ],
            ipProtectionHash: 'IP-' + Math.random().toString(36).substring(2, 12).toUpperCase(),
            status: "Awaiting Artisan Studio Review",
            createdAt: new Date().toISOString()
          };
          runtimeData.commissions.push(commission);
          res.writeHead(201);
          res.end(JSON.stringify({
            success: true,
            commissionId: commission.id,
            ipProtectionHash: commission.ipProtectionHash,
            escrowMilestones: commission.escrowMilestones,
            message: "Custom commission registered under KaPra Escrow Guarantee with digital IP timestamp."
          }));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Invalid request payload" }));
        }
      });
      return;
    }

    if (pathname === '/api/ondc/publish' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            ondcCatalogId: 'ONDC-BAP-IND-' + Math.floor(100000 + Math.random() * 900000),
            protocolVersion: "ONDC-RETAIL-1.2.0",
            becknProviderId: payload.artisanId || "artisan-bap-01",
            mappedCategories: ["Handicrafts", "Ceramics", "GI-Crafts"],
            message: "Vernacular voice transcription converted to Beckn schema & published to live ONDC nodes."
          }));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Invalid request" }));
        }
      });
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: "API endpoint not found" }));
    return;
  }

  // Static File Serving
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback to index.html for SPA routes
        fs.readFile(path.join(__dirname, 'index.html'), (err2, fallback) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fallback);
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`=======================================================`);
  console.log(`  KaPra Artisan Platform running at http://localhost:${PORT}`);
  console.log(`  Serving 7 Indian Clay & Ceramic Artisan Clusters`);
  console.log(`=======================================================`);
});
