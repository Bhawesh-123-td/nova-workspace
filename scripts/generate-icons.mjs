import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const colors = {
  ink: [9, 14, 27],
  deep: [14, 58, 65],
  teal: [36, 211, 194],
  blue: [74, 135, 255],
  mint: [126, 247, 217],
  ivory: [248, 252, 244],
  gold: [255, 218, 116],
  black: [0, 0, 0],
};

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (a, b, t) => a.map((value, index) => Math.round(lerp(value, b[index], t)));

function glow(base, color, amount) {
  return base.map((value, index) => Math.round(lerp(value, color[index], clamp(amount))));
}

function inRoundedRect(x, y, rx, ry, rw, rh, radius) {
  const cx = rx + rw / 2;
  const cy = ry + rh / 2;
  const qx = Math.abs(x - cx) - rw / 2 + radius;
  const qy = Math.abs(y - cy) - rh / 2 + radius;
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  return Math.min(Math.max(qx, qy), 0) + Math.sqrt(ax * ax + ay * ay) <= radius;
}

function pointInPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i][0];
    const yi = points[i][1];
    const xj = points[j][0];
    const yj = points[j][1];
    const crosses = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

function makeStar(cx, cy, outer, inner) {
  const points = [];
  for (let i = 0; i < 8; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / 4;
    points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  return points;
}

function isNovaMark(x, y) {
  return (
    inRoundedRect(x, y, 138, 148, 72, 232, 31) ||
    inRoundedRect(x, y, 302, 128, 72, 252, 31) ||
    pointInPolygon(x, y, [
      [188, 150],
      [244, 150],
      [366, 378],
      [310, 378],
    ])
  );
}

function blendPixel(buffer, width, x, y, rgb, alpha = 1) {
  const index = (y * width + x) * 4;
  const sourceAlpha = clamp(alpha);
  const destAlpha = buffer[index + 3] / 255;
  const outAlpha = sourceAlpha + destAlpha * (1 - sourceAlpha);
  if (outAlpha <= 0) return;

  for (let i = 0; i < 3; i += 1) {
    const dest = buffer[index + i] / 255;
    const source = rgb[i] / 255;
    const value = (source * sourceAlpha + dest * destAlpha * (1 - sourceAlpha)) / outAlpha;
    buffer[index + i] = Math.round(value * 255);
  }
  buffer[index + 3] = Math.round(outAlpha * 255);
}

function paintShape(buffer, size, predicate, colorForPoint, alpha = 1) {
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const px = ((x + 0.5) / size) * 512;
      const py = ((y + 0.5) / size) * 512;
      if (predicate(px, py)) {
        blendPixel(buffer, size, x, y, colorForPoint(px, py), alpha);
      }
    }
  }
}

function renderRaw(size, maskable = false) {
  const buffer = new Uint8Array(size * size * 4);
  const star = makeStar(398, 112, 52, 21);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const px = ((x + 0.5) / size) * 512;
      const py = ((y + 0.5) / size) * 512;
      const inside = maskable || inRoundedRect(px, py, 20, 20, 472, 472, 116);
      if (!inside) continue;

      const diagonal = clamp((px + py) / 1024);
      let rgb = mix(colors.ink, colors.deep, diagonal);

      const topGlow = Math.exp(-((px - 392) ** 2 + (py - 112) ** 2) / 22000);
      const lowerGlow = Math.exp(-((px - 96) ** 2 + (py - 402) ** 2) / 36000);
      rgb = glow(rgb, colors.teal, topGlow * 0.55);
      rgb = glow(rgb, colors.blue, lowerGlow * 0.24);

      blendPixel(buffer, size, x, y, rgb, 1);
    }
  }

  paintShape(buffer, size, (x, y) => isNovaMark(x - 8, y - 12), () => colors.black, 0.22);
  paintShape(buffer, size, (x, y) => pointInPolygon(x - 6, y - 8, star), () => colors.black, 0.2);

  paintShape(buffer, size, isNovaMark, (x, y) => {
    const sweep = clamp((x * 0.7 + y * 0.9) / 720);
    return mix(colors.ivory, colors.mint, sweep);
  });

  paintShape(buffer, size, (x, y) => pointInPolygon(x, y, star), (x, y) => {
    const center = Math.hypot(x - 398, y - 112);
    return mix(colors.ivory, colors.gold, clamp(center / 56));
  });

  paintShape(buffer, size, (x, y) => inRoundedRect(x, y, 108, 397, 180, 17, 8), () => colors.ivory, 0.2);
  paintShape(buffer, size, (x, y) => inRoundedRect(x, y, 108, 428, 112, 14, 7), () => colors.teal, 0.32);

  return buffer;
}

function downsample(source, sourceSize, targetSize) {
  if (sourceSize === targetSize) return source;

  const factor = sourceSize / targetSize;
  const target = new Uint8Array(targetSize * targetSize * 4);

  for (let y = 0; y < targetSize; y += 1) {
    for (let x = 0; x < targetSize; x += 1) {
      const startX = Math.floor(x * factor);
      const endX = Math.floor((x + 1) * factor);
      const startY = Math.floor(y * factor);
      const endY = Math.floor((y + 1) * factor);
      const totals = [0, 0, 0, 0];
      let count = 0;

      for (let sy = startY; sy < endY; sy += 1) {
        for (let sx = startX; sx < endX; sx += 1) {
          const sourceIndex = (sy * sourceSize + sx) * 4;
          totals[0] += source[sourceIndex];
          totals[1] += source[sourceIndex + 1];
          totals[2] += source[sourceIndex + 2];
          totals[3] += source[sourceIndex + 3];
          count += 1;
        }
      }

      const targetIndex = (y * targetSize + x) * 4;
      target[targetIndex] = Math.round(totals[0] / count);
      target[targetIndex + 1] = Math.round(totals[1] / count);
      target[targetIndex + 2] = Math.round(totals[2] / count);
      target[targetIndex + 3] = Math.round(totals[3] / count);
    }
  }

  return target;
}

function makeIcon(size, maskable = false) {
  const factor = size <= 32 ? 4 : 3;
  return downsample(renderRaw(size * factor, maskable), size * factor, size);
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data = Buffer.alloc(0)) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function makePng(width, height, rgba) {
  const rows = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * (width * 4 + 1);
    rows[rowOffset] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * width * 4, width * 4).copy(rows, rowOffset + 1);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', zlib.deflateSync(rows, { level: 9 })),
    pngChunk('IEND'),
  ]);
}

function makeDib(size, rgba) {
  const xor = Buffer.alloc(size * size * 4);
  const maskRowBytes = Math.ceil(size / 32) * 4;
  const mask = Buffer.alloc(maskRowBytes * size);

  for (let row = 0; row < size; row += 1) {
    const sourceY = size - 1 - row;
    for (let x = 0; x < size; x += 1) {
      const sourceIndex = (sourceY * size + x) * 4;
      const targetIndex = (row * size + x) * 4;
      xor[targetIndex] = rgba[sourceIndex + 2];
      xor[targetIndex + 1] = rgba[sourceIndex + 1];
      xor[targetIndex + 2] = rgba[sourceIndex];
      xor[targetIndex + 3] = rgba[sourceIndex + 3];

      if (rgba[sourceIndex + 3] < 128) {
        const maskIndex = row * maskRowBytes + Math.floor(x / 8);
        mask[maskIndex] |= 0x80 >> (x % 8);
      }
    }
  }

  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0);
  header.writeInt32LE(size, 4);
  header.writeInt32LE(size * 2, 8);
  header.writeUInt16LE(1, 12);
  header.writeUInt16LE(32, 14);
  header.writeUInt32LE(0, 16);
  header.writeUInt32LE(xor.length + mask.length, 20);
  header.writeInt32LE(0, 24);
  header.writeInt32LE(0, 28);
  header.writeUInt32LE(0, 32);
  header.writeUInt32LE(0, 36);

  return Buffer.concat([header, xor, mask]);
}

function makeIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const directory = Buffer.alloc(entries.length * 16);
  let offset = header.length + directory.length;
  const images = [];

  entries.forEach((entry, index) => {
    const dib = makeDib(entry.size, entry.rgba);
    const widthByte = entry.size >= 256 ? 0 : entry.size;
    const directoryOffset = index * 16;

    directory[directoryOffset] = widthByte;
    directory[directoryOffset + 1] = widthByte;
    directory[directoryOffset + 2] = 0;
    directory[directoryOffset + 3] = 0;
    directory.writeUInt16LE(1, directoryOffset + 4);
    directory.writeUInt16LE(32, directoryOffset + 6);
    directory.writeUInt32LE(dib.length, directoryOffset + 8);
    directory.writeUInt32LE(offset, directoryOffset + 12);

    images.push(dib);
    offset += dib.length;
  });

  return Buffer.concat([header, directory, ...images]);
}

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Nova Workspace">
  <defs>
    <linearGradient id="nova-bg" x1="64" y1="40" x2="456" y2="480" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#090e1b"/>
      <stop offset="0.56" stop-color="#0f2d37"/>
      <stop offset="1" stop-color="#1f6f68"/>
    </linearGradient>
    <radialGradient id="nova-glow" cx="392" cy="112" r="210" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#24d3c2" stop-opacity="0.72"/>
      <stop offset="1" stop-color="#24d3c2" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="nova-mark" x1="144" y1="132" x2="366" y2="392" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fbfff7"/>
      <stop offset="1" stop-color="#7ef7d9"/>
    </linearGradient>
    <linearGradient id="nova-star" x1="360" y1="62" x2="438" y2="172" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#ffda74"/>
    </linearGradient>
  </defs>
  <rect x="20" y="20" width="472" height="472" rx="116" fill="url(#nova-bg)"/>
  <rect x="20" y="20" width="472" height="472" rx="116" fill="url(#nova-glow)"/>
  <path fill="#000000" opacity="0.22" d="M146 380V168c0-17 13-30 30-30h12c12 0 23 6 30 16l94 144V148c0-17 13-30 30-30h12c17 0 30 13 30 30v222c0 17-13 30-30 30h-12c-11 0-22-6-28-15L218 237v133c0 17-13 30-30 30h-12c-17 0-30-13-30-30Z"/>
  <path fill="url(#nova-mark)" d="M138 370V158c0-17 13-30 30-30h12c12 0 23 6 30 16l94 144V138c0-17 13-30 30-30h12c17 0 30 13 30 30v222c0 17-13 30-30 30h-12c-11 0-22-6-28-15L210 227v133c0 17-13 30-30 30h-12c-17 0-30-13-30-30Z"/>
  <path fill="#000000" opacity="0.2" d="m398 68 17 40 43 4-33 28 10 42-37-23-37 23 10-42-33-28 43-4 17-40Z"/>
  <path fill="url(#nova-star)" d="m398 60 17 40 43 4-33 28 10 42-37-23-37 23 10-42-33-28 43-4 17-40Z"/>
  <rect x="108" y="397" width="180" height="17" rx="8" fill="#fbfff7" opacity="0.2"/>
  <rect x="108" y="428" width="112" height="14" rx="7" fill="#24d3c2" opacity="0.32"/>
</svg>
`;

const maskableSvg = iconSvg
  .replace('x="20" y="20" width="472" height="472" rx="116"', 'width="512" height="512"')
  .replace('x="20" y="20" width="472" height="472" rx="116"', 'width="512" height="512"');

async function main() {
  const publicIconDir = path.join(projectRoot, 'public', 'icons');
  const buildDir = path.join(projectRoot, 'build');
  await fs.mkdir(publicIconDir, { recursive: true });
  await fs.mkdir(buildDir, { recursive: true });

  const icon512 = makeIcon(512);
  const icon192 = makeIcon(192);
  const maskable512 = makeIcon(512, true);

  await fs.writeFile(path.join(publicIconDir, 'icon.svg'), iconSvg);
  await fs.writeFile(path.join(publicIconDir, 'maskable.svg'), maskableSvg);
  await fs.writeFile(path.join(publicIconDir, 'icon-512.png'), makePng(512, 512, icon512));
  await fs.writeFile(path.join(publicIconDir, 'icon-192.png'), makePng(192, 192, icon192));
  await fs.writeFile(path.join(publicIconDir, 'maskable-512.png'), makePng(512, 512, maskable512));
  await fs.writeFile(path.join(buildDir, 'icon.png'), makePng(512, 512, icon512));

  const icoEntries = [16, 24, 32, 48, 64, 128, 256].map((size) => ({
    size,
    rgba: makeIcon(size),
  }));
  await fs.writeFile(path.join(buildDir, 'icon.ico'), makeIco(icoEntries));

  console.log('Generated Nova Workspace icons.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
