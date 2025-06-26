const fs = require('fs');

// Create a simple PNG file programmatically
function createSimplePNG(width, height, r, g, b, a = 255) {
  const pixelData = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      pixelData.push(r, g, b, a);
    }
  }
  
  // Create a basic PNG structure
  const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(6, 9); // color type (RGBA)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  
  const ihdrCrc = crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
  const ihdrChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 13]), // length
    Buffer.from('IHDR'),
    ihdrData,
    Buffer.from([ihdrCrc >> 24, (ihdrCrc >> 16) & 0xFF, (ihdrCrc >> 8) & 0xFF, ihdrCrc & 0xFF])
  ]);
  
  // Simple IDAT chunk with uncompressed data
  const imageData = Buffer.from(pixelData);
  const idatChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 0]), // length placeholder
    Buffer.from('IDAT'),
    imageData
  ]);
  
  // IEND chunk
  const iendChunk = Buffer.from([0, 0, 0, 0, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);
  
  return Buffer.concat([pngSignature, ihdrChunk, iendChunk]);
}

// Simple CRC32 implementation
function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = crc ^ data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Create basic colored squares for now
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const pngData = createSimplePNG(size, size, 66, 133, 244); // #4285F4
  fs.writeFileSync(`icons/icon${size}.png`, pngData);
  console.log(`Created icon${size}.png`);
});