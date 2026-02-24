import sharp from 'sharp';

async function processImage(inputPath, outputPath, options) {
    try {
        let img = sharp(inputPath);
        let metadata = await img.metadata();

        // If we want to crop specific areas
        if (options.extract) {
            img = img.extract({
                left: Math.floor(metadata.width * (options.extract.leftPercent || 0)),
                top: Math.floor(metadata.height * (options.extract.topPercent || 0)),
                width: Math.floor(metadata.width * (options.extract.widthPercent || 1)),
                height: Math.floor(metadata.height * (options.extract.heightPercent || 1))
            });
        }

        const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

        // Removal of white/light background
        const threshold = 680;
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

        console.log(`Processed ${inputPath} -> ${outputPath}`);
    } catch (e) {
        console.error(`Error in ${inputPath}:`, e);
    }
}

async function run() {
    // VPO Logo: Crop out the text "MEDICINA INTERNA" that is baked into the image
    // to keep only the heart and "VPO digital". 
    // Usually the text is in the bottom 30%.
    await processImage('public/logo.png', 'public/logo_v3.png', {
        extract: { heightPercent: 0.70 } // Keep top 70%
    });

    // MedTech Logo: Keep almost everything to show the hand.
    // Skips only the very top if there's a light flare, but keeps the bottom.
    await processImage('public/medtech_logo.png', 'public/medtech_v3.png', {
        extract: { topPercent: 0, heightPercent: 0.95 } // Keep it all
    });
}

run();
