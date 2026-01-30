import fs from 'fs';
import path from 'path';

const sourcePath = '/Users/macbookpro/.gemini/antigravity/brain/d57218bd-1c6c-4144-9379-270cdfe845e5/aura_logo_white_bg_1769766185591.png';
const destPath = path.join(process.cwd(), 'public', 'aura_logo.png');

try {
    fs.copyFileSync(sourcePath, destPath);
    console.log('Success: Logo copied to ' + destPath);
} catch (err) {
    console.error('Error copying file:', err);
}
