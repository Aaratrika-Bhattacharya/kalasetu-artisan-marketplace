const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const { categories, defaultFilters, filterCatalog, relatedProducts } = require('../src/services/catalog');
const { sampleProducts, getSampleArtisan } = require('../src/services/sampleCatalog');
const { attachFeaturedMedia, mediaPreviews } = require('../src/services/featuredMedia');
const { requestShowcaseVideo } = require('../src/services/aiVideo');

const browse = (filters, saved = []) => filterCatalog(sampleProducts, { ...defaultFilters, ...filters }, saved);

test('all ten categories include a sample, including overlapping use-based categories', () => {
  assert.equal(categories.length, 10);
  for (const [label] of categories) assert.ok(browse({ category: label }).length, label);
  assert.deepEqual(browse({ category: 'Table & Office Decor', material: 'Sheesham wood' }).map((p) => p.slug), ['wood']);
});

test('facets combine with text search and price ranges', () => {
  const matches = browse({ region: 'Odisha', material: 'Cotton', craft: 'Sambalpuri Ikat', search: 'indigo odisha', min: '1000', max: '1600' });
  assert.deepEqual(matches.map((p) => p.slug), ['ikat']);
  assert.equal(browse({ region: 'Odisha', max: '100' }).length, 0);
});

test('stock filters distinguish ready, made to order and sold out', () => {
  assert.deepEqual(browse({ availability: 'made' }).map((p) => p.slug), ['madhubani']);
  assert.deepEqual(browse({ availability: 'sold' }).map((p) => p.slug), ['filigree']);
  assert.equal(browse({ availability: 'ready' }).length, sampleProducts.length - 2);
});

test('sort, curated collections and wishlist respect the filtered catalog', () => {
  const gifts = browse({ collection: 'Gifting', sort: 'price-low' });
  assert.equal(gifts[0].slug, 'diyas');
  assert.equal(browse({ collection: 'Festivals', saved: true }, ['sample-ikat', 'sample-wood'])[0].slug, 'ikat');
  assert.equal(browse({ trending: true }).every((p) => p.isTrendingSample), true);
});

test('related products prioritise a shared artisan and sample profiles stay unverified', () => {
  const pot = sampleProducts.find((p) => p.slug === 'terracotta');
  assert.equal(relatedProducts(pot, sampleProducts)[0].slug, 'diyas');
  assert.equal(getSampleArtisan(pot.artisan.id).products.length, 2);
  assert.notEqual(getSampleArtisan(pot.artisan.id).verificationStatus, 'VERIFIED');
});

test('AI video service reports availability without returning generated media', () => {
  const result = requestShowcaseVideo({ images: [], style: 'Studio showcase' });
  assert.equal(result.status, 'coming-soon');
  assert.deepEqual(Object.keys(result).sort(), ['message', 'status']);
});

test('six supplied clips resolve to local assets across four matching pieces', () => {
  assert.equal(mediaPreviews.length, 4);
  assert.equal(mediaPreviews.flatMap((p) => p.craftDetails.videos).length, 6);
  for (const product of mediaPreviews) {
    for (const asset of [product.images[0].imageUrl, ...product.craftDetails.videos.map((video) => video.url)]) {
      assert.ok(existsSync(resolve(__dirname, '../public', asset.slice(1))), asset);
    }
  }
});

test('featured horse media can be applied twice without duplicating its photo or clip', () => {
  const catalogHorse = {
    id: 'existing-horse', slug: 'sacred-bankura-terracotta-horse-16in',
    images: [{ id: 'old', imageUrl: '/old.jpg', isPrimary: true }],
    craftDetails: { videoUrl: '/seller-clip.mp4', story: 'Original story' },
  };
  const featured = attachFeaturedMedia(attachFeaturedMedia(catalogHorse));
  assert.equal(featured.id, catalogHorse.id);
  assert.equal(featured.images[0].imageUrl, '/product-media/bankura-horse.jpeg');
  assert.deepEqual(featured.images.map((image) => image.isPrimary), [true, false]);
  assert.equal(featured.craftDetails.videos.length, 1);
  assert.equal(featured.craftDetails.videoUrl, '/seller-clip.mp4');
});
