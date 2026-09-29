const fs = require('fs');
const zlib = require('zlib');

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makePngChunk(type, data) {
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const payload = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(payload), 0);
  return Buffer.concat([lenBuf, payload, crcBuf]);
}

function encodeRGBAtoPNG(w, h, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makePngChunk('IHDR', ihdr);
  const scanlines = Buffer.alloc(h * (1 + w * 4));
  let inOffset = 0;
  let outOffset = 0;

  for (let y = 0; y < h; y++) {
    scanlines[outOffset++] = 0;
    rgbaBuffer.copy(scanlines, outOffset, inOffset, inOffset + w * 4);
    outOffset += w * 4;
    inOffset += w * 4;
  }

  const idatChunk = makePngChunk('IDAT', zlib.deflateSync(scanlines, { level: 9 }));
  const iendChunk = makePngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function decodeAscii85(str) {
  str = str.replace(/\s+/g, '').replace(/^<~/, '').replace(/~>$/, '');
  const out = [];
  let tuple = 0, count = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c === 122) { out.push(0,0,0,0); continue; }
    if (c < 33 || c > 117) continue;
    tuple = tuple * 85 + (c - 33);
    count++;
    if (count === 5) {
      out.push((tuple >>> 24) & 255, (tuple >>> 16) & 255, (tuple >>> 8) & 255, tuple & 255);
      tuple = 0; count = 0;
    }
  }
  if (count > 1) {
    for (let i = count; i < 5; i++) tuple = tuple * 85 + 84;
    for (let i = 0; i < count - 1; i++) out.push((tuple >>> (24 - i * 8)) & 255);
  }
  return Buffer.from(out);
}

// 1. Read PDF & Extract RGB Buffer
const pdfBuf = fs.readFileSync('GENZ_3D_Logo_Website.pdf');
const s = pdfBuf.toString('latin1');
const startIdx = 371 + 'stream\n'.length;
const streamText = s.substring(startIdx, 2359658);
const rgb = zlib.inflateSync(decodeAscii85(streamText));

const origW = 1536, origH = 1024;

// 2. Crop boundaries
const minX = Math.max(0, 89 - 10);
const maxX = Math.min(origW - 1, 1478 + 10);
const minY = Math.max(0, 158 - 10);
const maxY = Math.min(origH - 1, 846 + 10);

const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;

console.log('Cropping logo to:', cropW, 'x', cropH);

const logoRgba = Buffer.alloc(cropW * cropH * 4);

for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const origIdx = ((minY + y) * origW + (minX + x)) * 3;
    const destIdx = (y * cropW + x) * 4;

    const r = rgb[origIdx];
    const g = rgb[origIdx + 1];
    const b = rgb[origIdx + 2];

    const brightness = (r + g + b) / 3;
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);

    let outR = r, outG = g, outB = b, outA = 255;

    // Check if background / shadow
    if (saturation < 22 && brightness >= 180) {
      if (brightness >= 230) {
        outA = 0; // Pure white background gone
      } else {
        // Soft drop shadow converted to transparent black
        const alphaFactor = Math.pow((230 - brightness) / 50, 1.3);
        outR = 0;
        outG = 0;
        outB = 0;
        outA = Math.min(180, Math.round(alphaFactor * 160));
      }
    } else if (saturation < 14 && brightness > 150) {
      // Very faint edge shadow
      outR = 0;
      outG = 0;
      outB = 0;
      outA = Math.round(((200 - brightness) / 50) * 140);
    } else {
      // Solid letter / metallic gold chrome
      outA = 255;
    }

    logoRgba[destIdx] = outR;
    logoRgba[destIdx + 1] = outG;
    logoRgba[destIdx + 2] = outB;
    logoRgba[destIdx + 3] = outA;
  }
}

// Save Full Cropped Transparent Logo
const logoPng = encodeRGBAtoPNG(cropW, cropH, logoRgba);
fs.writeFileSync('public/images/genz-3d-logo.png', logoPng);
console.log('Saved: public/images/genz-3d-logo.png');

// 3. Generate Favicon with dark circular or shield badge backing for ultimate contrast in all browser tabs
function generateFavicon(size) {
  const favBuf = Buffer.alloc(size * size * 4);
  
  // Background: sleek dark circle with gold ring so it pops in ANY browser tab (light or dark mode)
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.47;
  const innerRadius = size * 0.44;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dstIdx = (y * size + x) * 4;
      const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));

      if (dist <= innerRadius) {
        favBuf[dstIdx] = 14;     // R (Carbon Dark)
        favBuf[dstIdx + 1] = 14; // G
        favBuf[dstIdx + 2] = 18; // B
        favBuf[dstIdx + 3] = 255;// A
      } else if (dist <= radius) {
        // Gold Border Ring
        favBuf[dstIdx] = 212;    // Gold R
        favBuf[dstIdx + 1] = 175;// Gold G
        favBuf[dstIdx + 2] = 55; // Gold B
        favBuf[dstIdx + 3] = 255;
      } else if (dist <= radius + 1) {
        // Antialias outer ring
        favBuf[dstIdx] = 212;
        favBuf[dstIdx + 1] = 175;
        favBuf[dstIdx + 2] = 55;
        favBuf[dstIdx + 3] = Math.round((1 - (dist - radius)) * 255);
      } else {
        favBuf[dstIdx + 3] = 0;
      }
    }
  }

  // Resample cropped logo centered inside the badge
  const innerBox = size * 0.82;
  const scale = Math.min(innerBox / cropW, innerBox / cropH);
  const targetW = Math.round(cropW * scale);
  const targetH = Math.round(cropH * scale);
  const offX = Math.round((size - targetW) / 2);
  const offY = Math.round((size - targetH) / 2);

  for (let y = 0; y < targetH; y++) {
    const srcY = Math.floor(y / scale);
    for (let x = 0; x < targetW; x++) {
      const srcX = Math.floor(x / scale);
      const srcIdx = (srcY * cropW + srcX) * 4;
      const dstIdx = ((offY + y) * size + (offX + x)) * 4;

      const alpha = logoRgba[srcIdx + 3] / 255;
      if (alpha > 0.05) {
        favBuf[dstIdx] = Math.round(logoRgba[srcIdx] * alpha + favBuf[dstIdx] * (1 - alpha));
        favBuf[dstIdx + 1] = Math.round(logoRgba[srcIdx + 1] * alpha + favBuf[dstIdx + 1] * (1 - alpha));
        favBuf[dstIdx + 2] = Math.round(logoRgba[srcIdx + 2] * alpha + favBuf[dstIdx + 2] * (1 - alpha));
        favBuf[dstIdx + 3] = Math.max(favBuf[dstIdx + 3], logoRgba[srcIdx + 3]);
      }
    }
  }

  return encodeRGBAtoPNG(size, size, favBuf);
}

fs.writeFileSync('public/favicon.png', generateFavicon(192));
fs.writeFileSync('public/favicon-32x32.png', generateFavicon(32));
console.log('Saved contrast-badge favicons: public/favicon.png and public/favicon-32x32.png');

// 4. Generate SVG Favicon
const favB64 = generateFavicon(128).toString('base64');
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <image href="data:image/png;base64,${favB64}" width="128" height="128"/>
</svg>`;
fs.writeFileSync('public/favicon.svg', svgContent);
console.log('Saved: public/favicon.svg');
