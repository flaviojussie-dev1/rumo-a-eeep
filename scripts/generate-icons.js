import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Function to generate a raw uncompressed PNG in pure Node.js
function createPNG(width, height, drawFn) {
  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowStart = y * (rowSize + 1);
    rawData[rowStart] = 0; // Filter byte: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pixelStart = rowStart + 1 + x * bytesPerPixel;
      rawData[pixelStart] = r;
      rawData[pixelStart + 1] = g;
      rawData[pixelStart + 2] = b;
      rawData[pixelStart + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // CRC32 calculation table
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c >>> 0;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crc]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Deflate
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Non-interlaced

  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', deflated);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Draw EEEP Orienta icon (Deep Navy background with Gold & White academic capelo & book motif)
function drawAppIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const r = w / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background: gradient from #1E3A66 to #0B1930
  const gradT = (y / h + (x / w) * 0.3) / 1.3;
  let bgR = Math.round(30 * (1 - gradT) + 11 * gradT);
  let bgG = Math.round(58 * (1 - gradT) + 25 * gradT);
  let bgB = Math.round(102 * (1 - gradT) + 48 * gradT);

  // Border ring
  const safeRadius = isMaskable ? r * 0.78 : r * 0.92;

  // Let's draw an open book / graduation cap symbol inside safe zone
  const nx = (x - cx) / (w * 0.5);
  const ny = (y - cy) / (h * 0.5);

  let isSymbol = false;
  let isGold = false;

  // Diamond top of mortarboard: |nx| / 0.65 + |ny + 0.22| / 0.28 <= 1
  const diamondDist = Math.abs(nx) / 0.62 + Math.abs(ny + 0.2) / 0.24;
  if (diamondDist <= 1) {
    isSymbol = true;
    if (diamondDist > 0.85) isGold = true;
  }

  // Cap skullcap base below diamond
  if (ny >= -0.05 && ny <= 0.18 && Math.abs(nx) <= 0.32) {
    isSymbol = true;
  }

  // Tassel hanging to right
  if (nx >= 0.3 && nx <= 0.45 && ny >= -0.2 && ny <= 0.25) {
    if (Math.abs(nx - 0.38 - (ny * 0.2)) < 0.05) {
      isSymbol = true;
      isGold = true;
    }
  }

  // Open book at bottom
  if (ny >= 0.24 && ny <= 0.58) {
    const bookY = ny - 0.24;
    const bookX = Math.abs(nx);
    if (bookX >= 0.06 && bookX <= 0.52 && bookY <= 0.3) {
      isSymbol = true;
      // Book spine line
      if (bookX < 0.1) isGold = true;
      // Lines inside pages
      if ((Math.round((ny - 0.28) * 40) % 3 === 0) && bookX > 0.14 && bookX < 0.46) {
        isSymbol = false; // Page lines
      }
    }
  }

  // Golden star / compass crest in the center
  if (nx * nx + (ny + 0.2) * (ny + 0.2) < 0.008) {
    isGold = true;
  }

  if (isSymbol) {
    if (isGold) {
      return [255, 201, 60, 255]; // Official Brand Gold #FFC93C
    }
    return [255, 255, 255, 255]; // Crisp white
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PNGs
console.log('Generating 192x192 icon...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, (x, y, w, h) => drawAppIcon(x, y, w, h, false)));

console.log('Generating 512x512 icon...');
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, (x, y, w, h) => drawAppIcon(x, y, w, h, false)));

console.log('Generating 512x512 maskable icon...');
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, (x, y, w, h) => drawAppIcon(x, y, w, h, true)));

console.log('Generating apple-touch-icon.png (180x180)...');
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, (x, y, w, h) => drawAppIcon(x, y, w, h, false)));

// Generate crisp SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <!-- Background Gradient: Brand Navy Profundo -->
    <linearGradient id="bgNavy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E3A66" />
      <stop offset="50%" stop-color="#13294B" />
      <stop offset="100%" stop-color="#0A1628" />
    </linearGradient>

    <!-- Radial Soft Glow in Center -->
    <radialGradient id="centerGlow" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#2A5288" stop-opacity="0.65" />
      <stop offset="60%" stop-color="#13294B" stop-opacity="0" />
    </radialGradient>

    <!-- Brand Gold Gradient: Ouro Oficial (#FFC93C) -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF0A8" />
      <stop offset="35%" stop-color="#FFC93C" />
      <stop offset="100%" stop-color="#E59E0B" />
    </linearGradient>

    <!-- Border Ring Gradient -->
    <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFC93C" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#FFE082" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#E59E0B" stop-opacity="0.6" />
    </linearGradient>

    <!-- Shading for Cap Skull Base -->
    <linearGradient id="capBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#CBD5E1" />
    </linearGradient>

    <!-- Drop Shadows -->
    <filter id="shadowElevated" x="-15%" y="-15%" width="130%" height="135%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#040912" flood-opacity="0.6" />
    </filter>

    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#FFC93C" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- 1. Background Squircle -->
  <rect width="512" height="512" rx="124" fill="url(#bgNavy)" />
  <rect width="512" height="512" rx="124" fill="url(#centerGlow)" />
  
  <!-- Subtle Elegant Gold Outer Ring -->
  <rect x="14" y="14" width="484" height="484" rx="112" stroke="url(#goldBorder)" stroke-width="3" stroke-linecap="round" fill="none" />

  <!-- 2. Academic Graduation Cap (Capelo) -->
  <g filter="url(#shadowElevated)">
    <!-- 3D Bevel Rim beneath the cap -->
    <polygon points="90,188 256,268 422,188 422,196 256,276 90,196" fill="#94A3B8" />

    <!-- Mortarboard Top (Diamond) - Left facet (pure white) -->
    <polygon points="256,108 90,188 256,268 256,108" fill="#FFFFFF" />
    <!-- Mortarboard Top (Diamond) - Right facet (subtle illumination) -->
    <polygon points="256,108 422,188 256,268 256,108" fill="#F1F5F9" />

    <!-- Skull Cap Base (Band under the cap) -->
    <path d="M168,226 L168,272 C168,318 344,318 344,272 L344,226 C318,246 288,256 256,256 C224,256 194,246 168,226 Z" fill="url(#capBaseGrad)" />

    <!-- Center Button -->
    <circle cx="256" cy="188" r="12" fill="url(#goldGrad)" filter="url(#goldGlow)" />

    <!-- Golden Tassel (Pendão) -->
    <!-- Hanging cord -->
    <path d="M256,188 C312,192 396,214 408,270 L418,270 C406,206 314,185 256,188 Z" fill="url(#goldGrad)" />
    <!-- Tassel Ring -->
    <rect x="404" y="270" width="16" height="7" rx="2" fill="#D97706" />
    <!-- Tassel Fringe/Brush -->
    <path d="M402,277 L422,277 L418,340 C418,344 406,344 406,340 Z" fill="url(#goldGrad)" filter="url(#goldGlow)" />
  </g>

  <!-- 3. Open Book & Guiding Compass Symbol -->
  <g filter="url(#shadowElevated)">
    <!-- Left Page -->
    <path d="M250,324 C194,308 132,315 96,336 L96,400 C132,379 194,372 250,388 Z" fill="#FFFFFF" />
    <!-- Right Page -->
    <path d="M262,324 C318,308 380,315 416,336 L416,400 C380,379 318,372 262,388 Z" fill="#F1F5F9" />

    <!-- Book Spine / Center Divider -->
    <path d="M250,324 L262,324 L262,388 L250,388 Z" fill="#CBD5E1" />

    <!-- Page Accent Lines (Left Page) -->
    <line x1="126" y1="344" x2="216" y2="344" stroke="#94A3B8" stroke-width="3.5" stroke-linecap="round" />
    <line x1="126" y1="360" x2="200" y2="360" stroke="#94A3B8" stroke-width="3.5" stroke-linecap="round" />
    <line x1="126" y1="376" x2="216" y2="376" stroke="#94A3B8" stroke-width="3.5" stroke-linecap="round" />

    <!-- Page Accent Lines (Right Page) -->
    <line x1="296" y1="344" x2="386" y2="344" stroke="#94A3B8" stroke-width="3.5" stroke-linecap="round" />
    <line x1="312" y1="360" x2="386" y2="360" stroke="#94A3B8" stroke-width="3.5" stroke-linecap="round" />
    <line x1="296" y1="376" x2="386" y2="376" stroke="#94A3B8" stroke-width="3.5" stroke-linecap="round" />

    <!-- Golden Ribbon Bookmark extending down -->
    <path d="M252,322 L260,322 L260,424 L256,418 L252,424 Z" fill="url(#goldGrad)" filter="url(#goldGlow)" />
  </g>

  <!-- 4. Guiding Compass Star / "Rumo" (Center Crest) -->
  <g transform="translate(256, 305)" filter="url(#goldGlow)">
    <!-- 4-pointed Guiding Star -->
    <path d="M0,-16 L4,-4 L16,0 L4,4 L0,16 L-4,4 L-16,0 L-4,-4 Z" fill="url(#goldGrad)" />
    <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
console.log('Icons generated successfully.');
