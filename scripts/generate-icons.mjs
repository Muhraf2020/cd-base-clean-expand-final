// scripts/generate-icons.mjs
// Run with: node scripts/generate-icons.mjs

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, 'public');
const srcSvg = path.join(publicDir, 'logo-source.svg');

// All the PNG sizes we want to generate
const pngTargets = [
  { size: 180,  name: 'apple-touch-icon.png' }, // iOS home screen
  { size: 512,  name: 'android-chrome-512x512.png' }, // PWA large
  { size: 192,  name: 'android-chrome-192x192.png' }, // PWA small
  { size: 32,   name: 'favicon-32x32.png' }, // browser tab (hi-res)
  { size: 16,   name: 'favicon-16x16.png' }, // browser tab (legacy)
];

// Helper to generate one PNG from the SVG
async function generatePng(size, outName) {
  const outPath = path.join(publicDir, outName);
  console.log(`→ ${outName} (${size}x${size})`);
  await sharp(srcSvg)
    .resize(size, size, { fit: 'contain' })
    .png()
    .toFile(outPath);
}

// Generate all PNGs
async function run() {
  if (!fs.existsSync(srcSvg)) {
    console.error('logo-source.svg not found in /public. Did you save it as public/logo-source.svg?');
    process.exit(1);
  }

  // 1. PNG icons
  for (const t of pngTargets) {
    await generatePng(t.size, t.name);
  }

  // 2. ICO (favicon.ico)
  // We'll generate 32x32 .ico using the 32x32 render
  const fav32 = await sharp(srcSvg)
    .resize(32, 32, { fit: 'contain' })
    .png()
    .toBuffer();

  const icoOut = path.join(publicDir, 'favicon.ico');
  await sharp(fav32)
    .toFormat('ico')
    .toFile(icoOut);

  console.log('✅ All icons generated into /public');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
