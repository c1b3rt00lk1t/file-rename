const fs = require("fs");


// Starting from a hardcoded directory
const directory = "/mnt/c/Retrospectiva/ZParaRenombrar/Bloomberg";

// const directory = process.argv[2];
console.log(directory)
// 

fs.readdir(directory, (error, files) => {
  if (error) {
    throw error;
  }

  for (let file of files) {

    let pdfFile = directory + '/' + file;

    const firstUnderscore = file.indexOf('-');
    const name = [...file].slice(0, firstUnderscore - 1).join('');
    const composed = " - Bloomberg - " + name;

    let renameFile = directory + '/' + composed + ".pdf";

    fs.rename(pdfFile, renameFile, function (error) {
      if (error) {
        console.log("ERROR: " + error);
      }

      console.log(renameFile + " : File name successfully changed.");
    });
  }
});
