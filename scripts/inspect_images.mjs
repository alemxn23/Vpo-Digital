import sharp from 'sharp';
import fs from 'fs';

async function processImages() {
    try {
        const vpoMeta = await sharp('public/logo.png').metadata();
        console.log('VPO Logo size:', vpoMeta.width, 'x', vpoMeta.height);

        const medMeta = await sharp('public/medtech_logo.png').metadata();
        console.log('MedTech Logo size:', medMeta.width, 'x', medMeta.height);

        // Make an alpha channel by thresholding lightness and then invert
        // Or just use css filter brightness in App.tsx!

    } catch (err) {
        console.error(err);
    }
}

processImages();
