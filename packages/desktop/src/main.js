const { join } = require('path');
const { app, BrowserWindow } = require('electron');
const prepareNext = require('electron-next');
const isDev = require('electron-is-dev');
const { path: root } = require('app-root-path');

const relative = path => join(isDev ? 'packages/desktop' : '', path);
const resolve = path => join(root, relative(path));
const url = isDev
  ? `http://localhost:8000/`
  : `file://${resolve(`./src/renderer/out/index.html`)}`;
let window;

function start() {
  window = new BrowserWindow({ show: false });
  window.loadURL(url);

  window.once('ready-to-show', () => window.show());
  window.on('closed', () => (window = null));
}

app.on('ready', async () => {
  if (isDev) {
    console.log('Installing devtron');
    const devtron = require('devtron');
    require('devtron').install();

    console.log('Installing React Devtools');
    const {
      default: installExtension,
      REACT_DEVELOPER_TOOLS
    } = require('electron-devtools-installer');
    await installExtension(REACT_DEVELOPER_TOOLS);
  }

  console.log('Compiling Next');
  await prepareNext(relative('src/renderer'));

  console.log('Starting...');
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
