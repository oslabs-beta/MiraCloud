//this file is the main process (everything that deals with node) of electron
const { app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');

 //Install with npm install rimraf, or just drop rimraf.js somewhere.
const rimraf = require("rimraf");

// Get credentials
ipcMain.on('getCredentials', (event, arg) => {
  //finds the folder with the credentials currently hardcoded.
  const homedir = require('os').homedir() +'/.aws/credentials';
  let file = fs.readFileSync(homedir,"utf8");
  file = file.match(/\=(.*)/g);
  file = [file[0].slice(2),file[1].slice(2)];
  event.returnValue = file;
})

//login
ipcMain.on('logIn', (event, arg) => {
  //create folder in root
  //finds root directory
  const homedir = require('os').homedir();
  //creates .aws folder
  if (!fs.existsSync(homedir + '/.aws')) fs.mkdirSync(homedir + '/.aws');
  //prepare content with keys
  let content = `[default] 
  aws_access_key_id = ${arg[0]}
  aws_secret_access_key = ${arg[1]}`;
  // create and write on credentials file
  fs.writeFileSync(homedir + '/.aws/credentials',content);
  event.returnValue = 'done';
})

// save .pem file with KeyPair information in it 
ipcMain.on('createKeyPair', ((event, data) => {
  // path to root
  const homedir = require('os').homedir();
  // create file in desktop 
  fs.writeFileSync(homedir + `/Downloads/${data.KeyName}.pem`,data.KeyMaterial);
  event.returnValue = 'done';
}));

// logout-Delete credentials file and folder
ipcMain.on('logOut', (event, arg ) => {
  const homedir = require('os').homedir() + '/.aws';
  rimraf.sync(homedir);
  event.returnValue = 'done';
})

// main process for activate electron app
let mainWindow;

function initializeWindow() {
  //when you create a new browser window you start a new render process 
  //Render process is part of the electron that deals with the front-end
  mainWindow = new BrowserWindow({});
  mainWindow.maximize(); // opens full screen window onClick
  // loading into render process in the index html (compiling webpack)
  mainWindow.loadFile(path.join(__dirname, './dist/index.html'));
  // mainWindow.webContents.openDevTools();
  mainWindow.on('closed', () => {
  mainWindow = null; // when u close deletes window
  });
};

//  might be additional,does same operation with 'activate'
app.on('ready', initializeWindow);

app.on('window-all-closed', () => {
  //for mac computers to really quit the application
	// darwin is a codename for mac computers
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

//do research on app on events!
app.on('activate', () => {
  if (mainWindow === null) {
    initializeWindow();
  }
});

