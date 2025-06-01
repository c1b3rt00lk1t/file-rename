import fs from 'fs';
import path from 'path';

async function extractDate(pdfPath) {
  const { default: pdfjsLib } = await import('pdfjs-dist/legacy/build/pdf.js');
  const loadingTask = pdfjsLib.getDocument(pdfPath);
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const content = await page.getTextContent();

  // Concatenate all text items from the first page
  const text = content.items.map(item => item.str).join(' ');

  // Match date in format: Mon DD, YYYY (e.g., May 2, 2025)
  const dateRegex = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})\b/;
  const match = text.match(dateRegex);

  if (!match) return null;

  // Convert to YYYYMMDD
  const months = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
  };
  const month = months[match[1]];
  const day = match[2].padStart(2, '0');
  const year = match[3];
  return `${year}${month}${day}`;
}

async function processFolder(folderPath) {
  const files = fs.readdirSync(folderPath).filter(f => f.toLowerCase().endsWith('.pdf'));
  const outDir = path.join(folderPath, 'withDates');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  for (const file of files) {
    const fullPath = path.join(folderPath, file);
    console.log(`Processing: ${file}`);
    const dateStr = await extractDate(fullPath);

    if (!dateStr) {
      console.log('  No date found, skipping.');
      continue;
    }

    const newName = `${dateStr}${file}`;
    const newPath = path.join(outDir, newName);
    fs.copyFileSync(fullPath, newPath);
    console.log(`  Copied to: ${newName}`);
  }

  console.log('Done!');
  process.exit(0);
}

// Change the folder path as needed
processFolder('C:/Retrospectiva/ZParaRenombrar/Bloomberg');