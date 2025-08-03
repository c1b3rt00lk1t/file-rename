import fs from 'fs';
import path from 'path';

async function extractDate(pdfPath) {
  try {
    const { default: pdfjsLib } = await import('pdfjs-dist/legacy/build/pdf.js');
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const content = await page.getTextContent();

    // Concatenate all text items from the first page
    const text = content.items.map(item => item.str).join(' ');

    // Try multiple date patterns commonly found in Bloomberg articles
    const datePatterns = [
      // Original pattern: May 2, 2025
      /\b(Jan|Feb|Mar|Apr|May|June|July|August|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})\b/,
      // Pattern: January 2, 2025
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(\d{4})\b/,
      // Pattern: 2025-01-02 or 2025/01/02
      /\b(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})\b/,
      // Pattern: 02/01/2025 or 02-01-2025
      /\b(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})\b/,
      // Pattern: May 2 2025 (without comma)
      /\b(Jan|Feb|Mar|Apr|May|June|July|August|Sep|Oct|Nov|Dec)\s+(\d{1,2})\s+(\d{4})\b/,
      // Pattern: 2 May 2025
      /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|June|July|August|Sep|Oct|Nov|Dec)\s+(\d{4})\b/
    ];

    let match = null;
    let matchedPattern = -1;
    
    for (let i = 0; i < datePatterns.length; i++) {
      match = text.match(datePatterns[i]);
      if (match) {
        matchedPattern = i;
        break;
      }
    }

    if (!match) return null;

    // Convert to YYYYMMDD based on the matched pattern
    const shortMonths = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', June: '06',
      July: '07', August: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };
    const longMonths = {
      January: '01', February: '02', March: '03', April: '04', May: '05', June: '06',
      July: '07', August: '08', September: '09', October: '10', November: '11', December: '12'
    };

    let year, month, day;

    switch (matchedPattern) {
      case 0: // May 2, 2025
      case 4: // May 2 2025 (without comma)
        month = shortMonths[match[1]];
        day = match[2].padStart(2, '0');
        year = match[3];
        break;
      case 1: // January 2, 2025
        month = longMonths[match[1]];
        day = match[2].padStart(2, '0');
        year = match[3];
        break;
      case 2: // 2025-01-02 or 2025/01/02
        year = match[1];
        month = match[2].padStart(2, '0');
        day = match[3].padStart(2, '0');
        break;
      case 3: // 02/01/2025 or 02-01-2025 (assuming MM/DD/YYYY format)
        month = match[1].padStart(2, '0');
        day = match[2].padStart(2, '0');
        year = match[3];
        break;
      case 5: // 2 May 2025
        day = match[1].padStart(2, '0');
        month = shortMonths[match[2]];
        year = match[3];
        break;
    }

    return `${year}${month}${day}`;
  } catch (error) {
    console.log(`  Error processing PDF: ${error.message}`);
    // Return a special error indicator instead of null
    return { error: error.message };
  }
}

async function processFolder(folderPath) {
  const files = fs.readdirSync(folderPath).filter(f => f.toLowerCase().endsWith('.pdf'));
  const outDir = path.join(folderPath, 'withDates');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  let processedCount = 0;
  let errorCount = 0;
  let noDateCount = 0;
  const errorFiles = [];
  const noDateFiles = [];

  for (const file of files) {
    const fullPath = path.join(folderPath, file);
    console.log(`Processing: ${file}`);
    
    try {
      const dateStr = await extractDate(fullPath);

      // Check if there was an error during PDF processing
      if (dateStr && typeof dateStr === 'object' && dateStr.error) {
        console.log('  Skipping due to processing error.');
        errorCount++;
        errorFiles.push({ file, error: dateStr.error });
        continue;
      }

      if (!dateStr) {
        console.log('  No date found, skipping.');
        noDateCount++;
        noDateFiles.push(file);
        continue;
      }

      const newName = `${dateStr}${file}`;
      const newPath = path.join(outDir, newName);
      fs.copyFileSync(fullPath, newPath);
      console.log(`  Copied to: ${newName}`);
      processedCount++;
    } catch (error) {
      console.log(`  Error processing file: ${error.message}`);
      errorCount++;
      errorFiles.push({ file, error: error.message });
    }
  }

  console.log(`\nProcessing complete:`);
  console.log(`  Files successfully processed: ${processedCount}`);
  console.log(`  Files with errors: ${errorCount}`);
  console.log(`  Files with no date found: ${noDateCount}`);
  console.log(`  Total files: ${files.length}`);

  if (errorFiles.length > 0) {
    console.log(`\nFiles with errors:`);
    errorFiles.forEach(({ file, error }) => {
      console.log(`  - ${file}`);
      console.log(`    Error: ${error}`);
    });
  }

  if (noDateFiles.length > 0) {
    console.log(`\nFiles with no date found:`);
    noDateFiles.forEach(file => {
      console.log(`  - ${file}`);
    });
  }

  console.log('\nDone!');
  process.exit(0);
}

// Change the folder path as needed
processFolder('C:/Retrospectiva/ZParaRenombrar/Bloomberg');