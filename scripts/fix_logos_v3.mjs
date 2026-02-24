import sharp from 'sharp';

async function processVPOLogo() {
    try {
        const input = 'public/logo.png';
        const output = 'public/logo_final.png';

        // Convert to raw and force alpha
        const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

        // Stronger threshold for VPO logo to ensure NO white remains
        // Any pixel where R, G, and B are all > 240 will be transparent
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
                data[i + 3] = 0;
            }
        }

        await sharp(data, {
            raw: { width: info.width, height: info.height, channels: 4 }
        })
            .png()
            .trim()
            .toFile(output);

        console.log('VPO Logo processed with transparency force.');
    } catch (e) {
        console.error(e);
    }
}

async function processMedTechLogo() {
    try {
        const input = 'public/medtech_logo.png';
        const output = 'public/medtech_final.png';

        // For MedTech, we just want to ensure it is trimmed well
        await sharp(input)
            .trim()
            .toFile(output);

        console.log('MedTech Logo trimmed for better visibility.');
    } catch (e) {
        console.error(e);
    }
}

async function run() {
    await processVPOLogo();
    await processMedTechLogo();
}

run();
