// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, net } = require("electron");
const path = require("path");
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

const uploadFile = async (form) => {
  console.log(form);
  const reqOptions = {
    url: "http://dev6.ivantechnology.in/leaketronics/api/v1/upload-file",
    method: "POST",
    body: form,
    headers: {
      "Content-Type": "application/json",
    },
  };
  const request = net.request(reqOptions);
  request.on("response", (response) => {
    response.on("data", (chunk) => {
      console.log(`BODY: ${chunk}`);
    });
    response.on("end", () => {
      console.log("No more data in response.");
    });
  });
  request.end();
};

const b64toBlob = (byteCharacters, contentType = "", sliceSize = 512) => {
  // const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  const directoryPath = "D:\\Recovery";
  //passsing directoryPath and callback function
  // console.log(directoryPath);
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
      // Do whatever you want to do with the file
      console.log(path.extname(file).toLowerCase());
      if (path.extname(file).toLowerCase() === ".pdf") {
        console.log(`${directoryPath}\\${file}`);

      

        const form = new FormData();
        form.append("file", fs.createReadStream(`${directoryPath}\\${file}`));
        axios
          .post(
            "http://dev6.ivantechnology.in/leaketronics/api/v1/upload-file",
            form,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          )
          .then((res) => {
            console.log(`statusCode: ${res.status}`);
            console.log(res.data);
          })
          .catch((error) => {
            console.error(error);
          });

        // fs.readFile(
        //   `${directoryPath}\\${file}`,
        //   { encoding: "utf8" },
        //   (err, data) => {
        //     if (err) {
        //       console.error(err);
        //       return;
        //     }
        //     console.log(data);
        //     // const blobPdf = b64toBlob(data, "application/pdf");
        //     const form = new FormData();
        //     form.append("file", data, "sample.pdf");

        //     axios
        //       .post(
        //         "http://dev6.ivantechnology.in/leaketronics/api/v1/upload-file",
        //         form,
        //         {
        //           headers: {
        //             "Content-Type": "multipart/form-data",
        //           },
        //         }
        //       )
        //       .then((res) => {
        //         console.log(`statusCode: ${res.status}`);
        //         console.log(res.data);
        //       })
        //       .catch((error) => {
        //         console.error(error);
        //       });
        //   }
        // );
      }
    });
  });

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
