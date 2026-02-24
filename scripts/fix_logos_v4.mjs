import sharp from 'sharp';

async function processImage(inputPath, outputPath, options = {}) {
    try {
        let img = sharp(inputPath);

        // Remove white background and trim transparent edges
        // Increased threshold to capture light shadows/anti-aliasing
        const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

        const threshold = 680; // (Avg > 226 per channel)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            if (r + g + b > threshold) {
                data[i + 3] = 0;
            }
        }

        await sharp(data, {
            raw: { width: info.width, height: info.height, channels: 4 }
        })
            .png()
            .trim()
            .toFile(outputPath);

        console.log(`Successfully processed ${inputPath} -> ${outputPath}`);
    } catch (e) {
        console.error(`Error processing ${inputPath}:`, e);
    }
}

async function run() {
    // Process VPO Digital Logo (keeping only heart and text, trimming blank spaces)
    // We already have "VPO digital logo .png" which is the high-res one
    await processImage('VPO digital logo .png', 'public/logo.png');

    // Process MedTech Labs Logo (ensure hand is included)
    // We use "Logo med tech labs.png" which has the full hand
    await processImage('Logo med tech labs.png', 'public/medtech_logo.png');
}

run();
