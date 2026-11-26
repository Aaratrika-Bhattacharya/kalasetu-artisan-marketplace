const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readCraftDetails, writeCraftDetails, mediaUrl } = require('../src/services/productDetails');

test('legacy listings may have no craft details', () => {
  assert.equal(readCraftDetails(null), undefined);
  assert.equal(writeCraftDetails(undefined), undefined);
});

test('craft metadata round-trips stories, media and merchandising', () => {
  const details = readCraftDetails(writeCraftDetails({
    videoUrl: '/uploads/craft-abcdef01.mp4',
    makingProcess: ' Fired after drying ',
    materials: [' Clay ', '', 'Glaze'],
    collections: ['Festivals'],
    ignoredField: 'unused',
  }));
  assert.deepEqual(details, {
    videoUrl: '/uploads/craft-abcdef01.mp4',
    makingProcess: 'Fired after drying',
    materials: ['Clay', 'Glaze'],
    collections: ['Festivals'],
  });
});

test('craft metadata accepts public media URLs and reports invalid entries', () => {
  assert.ok(mediaUrl('https://example.com/clip.webm'));
  assert.equal(mediaUrl('/other/clip.webm'), false);
  assert.throws(() => writeCraftDetails({ videoUrl: '/other/clip.webm' }), { statusCode: 400 });
  assert.throws(() => writeCraftDetails([]), { statusCode: 400 });
});
