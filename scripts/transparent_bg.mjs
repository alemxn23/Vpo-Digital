import sharp from 'sharp';

async function processImage(inputPath, outputPath, cropHeight = null) {
    try {
        let img = sharp(inputPath);
        let metadata = await img.metadata();

        if (cropHeight) {
            img = img.extract({
                left: 0,
                top: 0,
                width: metadata.width,
                height: cropHeight
            });
            metadata.height = cropHeight;
        }

        // Convert to raw pixel data
        const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

        // Threshold: if R,G,B are high (whitish), set Alpha to 0
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Determine if whitish (allowing some noise, e.g. >235)
            if (r > 235 && g > 235 && b > 235) {
                data[i + 3] = 0; // Transparent
            }
        }

        // Save with new raw data
        await sharp(data, {
            raw: {
                width: info.width,
                height: info.height,
                channels: 4
            }
        })
            .png()
            .toFile(outputPath);

        console.log(`Successfully processed ${inputPath} -> ${outputPath}`);
    } catch (err) {
        console.error(`Error processing ${inputPath}:`, err);
    }
}

async function run() {
    // Process VPO Logo (no crop)
    await processImage('public/logo.png', 'public/logo_transparent.png');

    // Process MedTech Logo (crop the bottom text, height from 685 to ~500)
    await processImage('public/medtech_logo.png', 'public/medtech_transparent.png', 530);
}

run();
