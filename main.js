const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true, // Démarre en plein écran
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
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
  serverProcess = spawn("node", [path.join(__dirname, "server", "generate-prompts.js")], {
    cwd: __dirname,
  });

  serverProcess.stdout.on("data", (data) => console.log(`Server stdout: ${data}`));
  serverProcess.stderr.on("data", (data) => console.error(`Server stderr: ${data}`));

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });

  ipcMain.on('quit-app', () => {
    if (serverProcess) {
      serverProcess.kill();
    }
    app.quit();
  });

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
