const { join } = require('path');
const { app, BrowserWindow } = require('electron');
const prepareNext = require('electron-next');
const isDev = require('electron-is-dev');
const { path: root } = require('app-root-path');

const resolve = path => join(root, isDev ? 'packages/desktop' : '', path);

let window;
const pageUrl = name =>
  isDev
    ? `http://localhost:8000/${name}`
    : `file://${resolve(`./renderer/out/${name}/index.html`)}`;

function start() {
  window = new BrowserWindow({ width: 800, height: 600 });
  window.loadURL(pageUrl('start'));

  if (isDev) window.webContents.openDevTools();
  window.on('closed', () => (window = null));
}

app.on('ready', async () => {
  await prepareNext('./packages/desktop/renderer');
  start();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (window === null) {
    start();
  }
});
