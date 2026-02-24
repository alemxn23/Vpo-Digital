import sharp from 'sharp';

async function processImage(inputPath, outputPath, cropHeightPercent = 1.0) {
    try {
        let img = sharp(inputPath);
        let metadata = await img.metadata();

        if (cropHeightPercent < 1.0) {
            const newHeight = Math.floor(metadata.height * cropHeightPercent);
            img = img.extract({
                left: 0,
                top: 0,
                width: metadata.width,
                height: newHeight
            });
        }

        // Convert to raw pixel data to manipulate alpha
        const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

        // Loop through pixels
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // If the pixel is very light (background), make it transparent
            // Standard white is 255, 255, 255. We'll capture everything above 230.
            if (r > 230 && g > 230 && b > 230) {
                data[i + 3] = 0;
            }
        }

        await sharp(data, {
            raw: {
                width: info.width,
                height: info.height,
                channels: 4
            }
        })
            .png()
            .toFile(outputPath);

        console.log(`Processed ${inputPath} -> ${outputPath}`);
    } catch (err) {
        console.error(`Error processing ${inputPath}:`, err);
    }
}

async function run() {
    // VPO Logo: No crop, just transparency
    await processImage('public/logo.png', 'public/logo_final.png');

    // MedTech Logo: Crop bottom ~22% to remove text, and transparency
    await processImage('public/medtech_logo.png', 'public/medtech_final.png', 0.78);
}

run();
