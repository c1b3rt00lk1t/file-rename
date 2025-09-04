/**
 * TODO:
 * select several titles to make DIFFERENT files, when the nummbers are separated by ;
 * 1,2;3,4;5
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

async function extractTitles(pdfPath) {
  const { default: pdfjsLib } = await import('pdfjs-dist/legacy/build/pdf.js');
  const loadingTask = pdfjsLib.getDocument(pdfPath);
  const pdf = await loadingTask.promise;
  const titles = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    let prevFontSize = null;
    let currentLine = '';

    content.items.forEach((item) => {
      if (item.transform && item.str && item.height > 15) {
        const fontSize = item.height;
        if (prevFontSize === fontSize) {
          currentLine += ' ' + item.str;
        } else {
          if (currentLine) titles.push(currentLine.trim());
          currentLine = item.str;
          prevFontSize = fontSize;
        }
      } else {
        if (currentLine) titles.push(currentLine.trim());
        currentLine = '';
        prevFontSize = null;
      }
    });
    if (currentLine) titles.push(currentLine.trim());
  }
  return titles;
}

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(question, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function processFolder(folderPath) {
  const files = fs.readdirSync(folderPath).filter(f => f.toLowerCase().endsWith('.pdf'));
  const renamedDir = path.join(folderPath, 'withTitles');
  if (!fs.existsSync(renamedDir)) {
    fs.mkdirSync(renamedDir);
  }

  for (const file of files) {
    const fullPath = path.join(folderPath, file);
    console.log(`\nFile: ${file}`);

    // Uncomment to open with Foxit Reader (adjust path if needed)
    // exec(`start "" "C:\\Program Files (x86)\\Foxit Software\\Foxit PDF Reader\\FoxitPDFReader.exe" "${fullPath}"`);

    const titles = await extractTitles(fullPath);
    titles.forEach((title, idx) => {
      console.log(`${idx + 1}: ${title}`);
    });

    const answer = await promptUser('Enter the numbers of the lines to combine for the new filename (use ; to separate different files, comma for combining lines): ');
    if (!answer.trim()) continue;

    // Split by ';' to get different file groups
    const groups = answer.split(';').map(group => group.trim()).filter(group => group.length > 0);
    
    if (groups.length === 0) continue;

    // Get the prefix (first 23 characters)
    const prefix = file.substring(0, 23);

    // Process each group to create a separate file
    groups.forEach((group, groupIndex) => {
      const indices = group.split(',').map(s => parseInt(s.trim(), 10) - 1).filter(i => i >= 0 && i < titles.length);
      
      if (indices.length === 0) {
        console.log(`Skipping group ${groupIndex + 1}: no valid indices`);
        return;
      }

      // Build the new name for this group (no suffix)
      const newTitle = indices.map(i => titles[i]).join(' ').replace(/[\\/:*?"<>|]/g, '').trim();
      const newName = `${prefix}${newTitle}.pdf`;
      const newPath = path.join(renamedDir, newName);

      // Copy the same original file with the new name
      fs.copyFileSync(fullPath, newPath);
      console.log(`Copied to: ${newPath}`);
      console.log(`  Based on: ${indices.map(i => `"${titles[i]}"`).join(' + ')}`);
    });
  }

  console.log(`Remember to run clean.js on the result`);
  // Exit the script after processing all PDFs
  process.exit(0);
}

// Change the folder path as needed
processFolder('C:/Retrospectiva/ZParaRenombrar/Expansión');