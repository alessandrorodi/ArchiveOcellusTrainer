const fs = require("fs");
const zlib = require("zlib");

const CHANNELS = { 2: 3, 6: 4 };

function decode(file) {
  const buf = fs.readFileSync(file);
  let pos = 8, width = 0, height = 0, channels = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString("ascii", pos + 4, pos + 8), data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      if (data[8] !== 8 || !CHANNELS[data[9]] || data[12] !== 0) throw new Error(`${file}: only 8-bit, non-interlaced RGB or RGBA PNGs are read`);
      [width, height, channels] = [data.readUInt32BE(0), data.readUInt32BE(4), CHANNELS[data[9]]];
    }
    if (type === "IDAT") idat.push(data);
    pos += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat)), stride = width * channels, px = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? px[y * stride + i - channels] : 0, b = y ? px[(y - 1) * stride + i] : 0, c = y && i >= channels ? px[(y - 1) * stride + i - channels] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      px[y * stride + i] = (raw[y * (stride + 1) + 1 + i] + [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][raw[y * (stride + 1)]]) & 255;
    }
  }
  return { width, height, channels, px };
}

function pixelShare(file, matches, area) {
  const { width, height, channels, px } = decode(file);
  const { minX, maxX, minY, maxY } = area ?? { minX: 0, maxX: width - 1, minY: 0, maxY: height - 1 };
  let hits = 0;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const i = (y * width + x) * channels;
      if (matches(px[i], px[i + 1], px[i + 2])) hits++;
    }
  }
  return Math.round((100000 * hits) / ((maxX - minX + 1) * (maxY - minY + 1))) / 1000;
}

module.exports = { decode, pixelShare };
