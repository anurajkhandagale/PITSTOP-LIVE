const sharp = require('sharp');
const pngToIco = require('png-to-ico').default;
const fs = require('fs');
const path = require('path');

const inputImagePath = 'C:\\Users\\Anuraj\\.gemini\\antigravity\\brain\\d95934ab-585a-49ab-a430-5d721553f56a\\favicon_base_1777374194290.png';
const outputDir = path.join(__dirname, 'favicons');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const sizes = [16, 32, 48, 64];

async function processImage() {
  try {
    // Read the original image to get its dimensions
    const metadata = await sharp(inputImagePath).metadata();
    const size = Math.min(metadata.width, metadata.height);

    // Create a circular SVG mask
    const circleSvg = `
      <svg width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white" />
      </svg>
    `;

    // Extract the center square and apply the circular mask to make corners transparent
    const circularImageBuffer = await sharp(inputImagePath)
      .resize(size, size)
      .composite([{
        input: Buffer.from(circleSvg),
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();

    const pngPaths = [];

    // Generate PNGs for each size
    for (const s of sizes) {
      const outPath = path.join(outputDir, `favicon-${s}x${s}.png`);
      await sharp(circularImageBuffer)
        .resize(s, s, {
          kernel: sharp.kernel.lanczos3, // Best for downscaling icons
        })
        .toFile(outPath);
      
      console.log(`Created ${outPath}`);
      pngPaths.push(outPath);
    }

    // Generate multi-size .ico
    const icoPath = path.join(outputDir, 'favicon.ico');
    const buf = await pngToIco(pngPaths);
    fs.writeFileSync(icoPath, buf);
    console.log(`Created ${icoPath}`);

  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

processImage();
