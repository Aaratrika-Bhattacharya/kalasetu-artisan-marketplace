const textFields = ['videoUrl', 'makingProcess', 'story', 'heritage', 'artForm', 'careInstructions'];
const listFields = ['materials', 'collections'];

function readCraftDetails(value) {
  return value ? JSON.parse(value) : undefined;
}

function mediaUrl(value) {
  return typeof value === 'string' &&
    (/^\/uploads\/craft-[a-f0-9-]+\.(?:jpg|png|webp|mp4|webm)$/.test(value) ||
      /^https?:\/\/[^\s]+$/i.test(value));
}

function writeCraftDetails(value) {
  if (value === undefined) return undefined;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw Object.assign(new Error('Craft details must be an object.'), { statusCode: 400 });
  }
  const details = {};
  for (const key of textFields) {
    if (typeof value[key] === 'string' && value[key].trim()) {
      details[key] = value[key].trim().slice(0, 4000);
    }
  }
  if (details.videoUrl && !mediaUrl(details.videoUrl)) {
    throw Object.assign(new Error('Use an uploaded video or an HTTP(S) video URL.'), { statusCode: 400 });
  }
  for (const key of listFields) {
    if (Array.isArray(value[key])) {
      details[key] = value[key].filter((entry) => typeof entry === 'string')
        .map((entry) => entry.trim().slice(0, 100)).filter(Boolean).slice(0, 20);
    }
  }
  return JSON.stringify(details);
}

module.exports = { readCraftDetails, writeCraftDetails, mediaUrl };
