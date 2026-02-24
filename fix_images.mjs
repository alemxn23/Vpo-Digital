import sharp from 'sharp';

async function fixImages() {
  try {
    const vpoMeta = await sharp('public/logo.png').metadata();
    console.log('VPO Logo size:', vpoMeta.width, 'x', vpoMeta.height);

    const medMeta = await sharp('public/medtech_logo.png').metadata();
    console.log('MedTech Logo size:', medMeta.width, 'x', medMeta.height);

  } catch (err) {
    console.error(err);
  }
}

fixImages();
