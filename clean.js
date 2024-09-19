const fs = require("fs");


// Starting from a hardcoded directory
const folderPath = "C:/Retrospectiva/ZParaRenombrar/";

const folder = process.argv[2];

if (!folder) {
  console.error('Please provide a folder as the first argument.');
  process.exit(1);
}
const directory = folderPath + folder;
console.log(directory);

fs.readdir(directory, (error, files) => {
  if (error) {
    throw error;
  }

  for (let file of files) {

    let pdfFile = directory + '/' + file;

    const clean = file.replace(/[“”‘’&\/\\#,+()$~%'":*?<>{}]/g,'_');

    let renameFile = directory + '/' + clean ;

    fs.rename(pdfFile, renameFile, function (error) {
      if (error) {
        console.log("ERROR: " + error);
      }

      console.log(renameFile + " : File name successfully changed.");
    });
  }
});
