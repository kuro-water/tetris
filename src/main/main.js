const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const Store = require("electron-store");
const store = new Store();
const { handleWetris, handleRotate } = require("./wetris.js");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
	app.quit();
}

ipcMain.handle("readJson", async (event, Key) => {
	console.log("read : " + Key);
	data = store.get(Key);
	console.log(data);
	return data;
});
// ipcMain.handle("readJson", async (event, jsonPath) => {
// 	console.log("read : " + jsonPath);
// 	return JSON.parse(fs.readFileSync(__dirname + jsonPath, "utf-8"));
// });

ipcMain.handle("writeJson", async (event, Key, data) => {
	console.log("write : " + Key);
	store.set(Key, data);
	return;
});
// ipcMain.handle("writeJson", async (event, jsonPath, data) => {
// 	console.log("write : " + jsonPath);
// 	fs.writeFileSync(__dirname + jsonPath, JSON.stringify(data));
// 	return;
// });

handleWetris();

const createWindow = () => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		// width: 512,
		// height: 768,
		width: 1280,
		height: 720,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
		},
	});

	// and load the index.html of the app.
	mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));

	// Open the DevTools.
	mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it"s common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// On OS X it"s common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and import them here.
