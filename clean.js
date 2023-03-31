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
