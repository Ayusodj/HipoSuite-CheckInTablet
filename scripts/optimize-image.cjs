const fs = require('fs');
const path = require('path');

async function run() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/optimize-image.cjs <path-to-image>');
    process.exit(1);
  }
  const imgPath = args[0];

  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('sharp is not installed. Install with `npm install sharp --save-dev` and re-run.');
    process.exit(1);
  }

  const outputBasename = path.basename(imgPath, path.extname(imgPath));
  const dir = path.dirname(imgPath);

  const sizes = [1600, 1200, 800, 400];
  for (const w of sizes) {
    const outJpg = path.join(dir, `${outputBasename}-${w}.jpg`);
    await sharp(imgPath).resize({ width: w }).jpeg({ quality: 80 }).toFile(outJpg);
    console.log('Written', outJpg);

    const outWebp = path.join(dir, `${outputBasename}-${w}.webp`);
    await sharp(imgPath).resize({ width: w }).webp({ quality: 75 }).toFile(outWebp);
    console.log('Written', outWebp);
  }

  console.log('Done.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
