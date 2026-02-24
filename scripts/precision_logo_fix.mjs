import sharp from 'sharp';

async function processImage(inputPath, outputPath, cropOptions = null) {
    try {
        let img = sharp(inputPath);
        let metadata = await img.metadata();

        // 1. Initial crop to remove unwanted text/margins before transparency
        if (cropOptions) {
            img = img.extract({
                left: cropOptions.left || 0,
                top: cropOptions.top || 0,
                width: Math.floor(metadata.width * (cropOptions.widthPercent || 1)),
                height: Math.floor(metadata.height * (cropOptions.heightPercent || 1))
            });
        }

        // 2. Convert to raw data for pixel-perfect background removal
        const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

        // Threshold logic: If a pixel is "whitish", make it transparent.
        // We use a sum of R+G+B to identify light pixels.
        const threshold = 680; // (Avg > 226 per channel)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (r + g + b > threshold) {
                data[i + 3] = 0; // Alpha to 0
            }
        }

        // 3. Trim again to remove the empty space left by the removed background
        await sharp(data, {
            raw: {
                width: info.width,
                height: info.height,
                channels: 4
            }
        })
            .png()
            .trim() // Sharp's trim removes transparent edges automatically
            .toFile(outputPath);

        console.log(`Successfully processed ${inputPath} -> ${outputPath}`);
    } catch (err) {
        console.error(`Error processing ${inputPath}:`, err);
    }
}

async function run() {
    // VPO Logo: Just transparency + trim
    await processImage('public/logo.png', 'public/logo_v2.png');

    // MedTech Logo: Crop top 10% (light flare) and bottom ~25% (text), remove bg + trim
    await processImage('public/medtech_logo.png', 'public/medtech_v2.png', {
        top: Math.floor(685 * 0.1), // Skips top flare
        heightPercent: 0.65 // Keeps the heart middle section
    });
}

run();
