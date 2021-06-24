import { app, BrowserWindow, nativeTheme } from 'electron'
import { isFirstAppLaunch } from 'electron-util'
import * as fs from 'fs';
import * as usb from 'usb-detection';
import * as myFS from './pkgfilesystem';
import * as Store from 'electron-store';
const drivelist = require('drivelist');
import electron from "electron";
import { result } from 'lodash';
import checkDiskSpace from 'check-disk-space';
import { devTools } from 'electron-debug';
const path = require('path');

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }




/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = __dirname
}

let mainWindow



function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    useContentSize: true,
    resizable:false,
    frame: false,
    center: true,
    maximizable: false,
    show: false,
    fullscreenable: false,
    webPreferences: {
      // Change from /quasar.conf.js > electron > nodeIntegration;
      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: process.env.QUASAR_NODE_INTEGRATION,
      nodeIntegrationInWorker: process.env.QUASAR_NODE_INTEGRATION,

      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, 'electron-preload.js'),
      devTools: true
    }
  })
  mainWindow.loadURL(process.env.APP_URL)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}
app.allowRendererProcessReuse = false;

//////////////////////////////////////////////////////////////////
// App Events
//////////////////////////////////////////////////////////////////
const store = new Store();

usb.startMonitoring();


usb.on('add', function(device) {
  console.log(device)
  store.set('recentDeviceAdded', device.serialNumber);

  var storedDevices = store.get('devices');

  for (let x = 0; x < storedDevices.length; x++) {
    // Check each plugged in device against SNs
    if (storedDevices[x].sn == device.serialNumber) {
      store.set('storedDeviceConnected', storedDevices[x].sn);
      store.set('storedConnectedDeviceReady', false)
    }

  }
})

usb.on('remove', function(device) {
  if (device.serialNumber === store.get('recentDeviceAdded')) {
    store.delete('recentDeviceAdded');
  }
  if (device.serialNumber === store.get('storedDeviceConnected')) {
    store.delete('storedDeviceConnected');
    store.delete('storedConnectedDeviceReady');
  }
});

app.on('ready', createWindow)

if (isFirstAppLaunch()) {

  store.set('devices', [])
}



app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    store.delete('storedDeviceConnected');
    store.delete('recentDeviceAdded');
    store.delete('storedConnectedDeviceReady');
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('will-finish-launching', () => {
  myFS.initDirs(app.getPath('userData'));

  var storedDevices = store.get('devices');

  usb.find( async function(err, devices) {
    // For each stored device
    for (let x = 0; x < storedDevices.length; x++) {
      // Check each plugged in device against SNs
      for (let y = 0; y < devices.length; y++) {
        if (storedDevices[x].sn == devices[y].serialNumber) {
          store.set('storedDeviceConnected', storedDevices[x].sn);
          if (fs.existsSync(storedDevices[x].path)) {
            store.set('storedConnectedDeviceReady', true);
          }
          await new Promise(r => setTimeout(r, 3000))

        }
      }
    }
  });
})

//////////////////////////////////////////////////////////////////
// IPC
//////////////////////////////////////////////////////////////////


const ipcMain = electron.ipcMain;
const dialog = electron.dialog;

ipcMain.handle('selectDirectory', async (event, args) => {
    var dir = dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        defaultPath: args
    });
    return dir;
});

ipcMain.handle('selectFile', async function() {
  var file = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],

  })
  return file;
})

ipcMain.handle('getDevices', async function() {
  return store.get('devices');
})

ipcMain.handle('firstTime', () => {
  return isFirstAppLaunch();
})

ipcMain.on('minimize', () => {
  mainWindow.minimize();
})

ipcMain.on('closeWindow', () => {
  mainWindow.close();
})
