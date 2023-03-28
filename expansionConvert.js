const fs = require("fs");


// Starting from a hardcoded directory
const directory = "/mnt/c/Retrospectiva/ZParaRenombrar/Expansión/";

// const directory = process.argv[2];
console.log(directory)


fs.readdir(directory, (error, files) => {
  if (error) {
    throw error;
  }

  for (let file of files) {

    let pdfFile = directory + '/' + file;

    const firstUnderscore = file.indexOf('_');
    const day = [...file].slice(firstUnderscore - 2, firstUnderscore).join('');
    const month = [...file].slice(firstUnderscore + 1, firstUnderscore + 3).join('');
    const year = [...file].slice(firstUnderscore + 4 , firstUnderscore + 8).join('');
    const page = [...file].slice(file.length - 6 , file.length - 4).join('');


    let renameFile = directory + '/' + year + month + day + " - Expansión - " + page + ".pdf";

    fs.rename(pdfFile, renameFile, function (error) {
      if (error) {
        console.log("ERROR: " + error);
      }

      console.log(renameFile + " : File name successfully changed.");
    });
  }
});
