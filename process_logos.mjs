import sharp from 'sharp';

async function processImage(input, output) {
  try {
    await sharp(input)
      .trim({
        background: { r: 255, g: 255, b: 255, alpha: 1 },
        threshold: 20
      })
      .toFile(output);
    console.log(`Successfully processed ${input} -> ${output}`);
  } catch (e) {
    console.error(`Error processing ${input}:`, e);
  }
}

async function run() {
  await processImage('public/logo.png', 'public/logo_trimmed.png');
  await processImage('public/medtech_logo.png', 'public/medtech_logo_trimmed.png');
}

run();
