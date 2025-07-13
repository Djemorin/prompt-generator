const { app, BrowserWindow, globalShortcut } = require("electron");
const { exec } = require("child_process");
const path = require("path");

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true, // Démarre en plein écran
    webPreferences: {
      nodeIntegration: false,
    },
    title: "Générateur de Prompts",
  });

  mainWindow.loadURL("http://localhost:3000");

  mainWindow.on("closed", () => {
    mainWindow = null;
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  // 🔑 Raccourcis clavier
  globalShortcut.register("F11", () => {
    const isFullScreen = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFullScreen);
  });

  globalShortcut.register("Escape", () => {
    mainWindow.setFullScreen(false);
  });

  globalShortcut.register("CommandOrControl+Q", () => {
    app.quit();
  });
}

app.whenReady().then(() => {
  serverProcess = exec("npm start", {
    cwd: __dirname,
    shell: true,
  });

  serverProcess.stdout.on("data", (data) => console.log(data));
  serverProcess.stderr.on("data", (data) => console.error(data));

  setTimeout(createWindow, 1000);
});

app.on("will-quit", () => {
  // Nettoyer les raccourcis
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
