'use strict'

import {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog
} from 'electron'
import menuconfig from './menu'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, aboutWin
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const aboutURL = winURL + '#/about'

var ready = false
var fileToOpen = global.fileToOpen = null

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 300,
    minHeight: 300,
    icon: './src/assets/logo.png',
    useContentSize: true,
    show: false,
    backgroundColor: '#fffff',
    // titleBarStyle: 'hidden',
    webPreferences: {
      plugins: true,
      nodeIntegration: true,
      webSecurity: false,
      experimentalFeatures: true
    },
    frame: true
    // 隐藏边框
    // frame: false,
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  const menu = Menu.buildFromTemplate(menuconfig(mainWindow))
  Menu.setApplicationMenu(menu)
  mainWindow.loadURL(winURL)

  // Create about window
  menu.getMenuItemById('about').click = () => {
    if (!aboutWin) {
      aboutWin = new BrowserWindow({
        width: 400,
        height: 250,
        icon: './src/assets/logo.png',
        resizable: false,
        frame: false,
        // parent: mainWindow,
        // modal: true,
        webPreferences: {
          nodeIntegration: true
        }
      })

      aboutWin.loadURL(aboutURL)

      aboutWin.on('closed', () => {
        aboutWin = null
      })
    }
  }

  mainWindow.webContents.on('did-finish-load', function () {
    if (fileToOpen) {
      mainWindow.webContents.send('file-open', fileToOpen)
      fileToOpen = null
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Add event listener for enabling/disabling menu items
  ipcMain.on('toggle-menu-items', (event, flag) => {
    menu.getMenuItemById('file-print').enabled = flag
    menu.getMenuItemById('file-properties').enabled = flag
    menu.getMenuItemById('file-close').enabled = flag
    menu.getMenuItemById('view-fullscreen').enabled = flag
  })

  ipcMain.on('onselect', (event) => {
    dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] }
      ]
    }, (filename) => {
      if (filename && filename.length) {
        mainWindow.webContents.send('file-open',
          filename.toString())
      }
    })
  })

  ipcMain.on('ondragstart', (event, filePath) => {
    mainWindow.webContents.send('file-open', filePath)
  })

  ready = true
}

app.on('ready', createWindow)

// app.on('ready', () => {
//   // protocol.interceptFileProtocol('file', (request, callback) => {
//   //   const url = request.url.substr(7) /* all urls start with 'file://' */
//   //   console.log(request)
//   //   callback(path.normalize(`${__dirname}/${url}`))
//   // }, (err) => {
//   //   if (err) console.error('Failed to register protocol')
//   // })
//   createWindow()
// })

app.on('window-all-closed', () => {
  ready = false
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('second-instance', (event, commandLine) => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.focus()
    mainWindow.webContents.send('external-file-open', commandLine)
  }
})

app.on('open-file', (event, filePath) => {
  event.preventDefault()
  fileToOpen = filePath
  if (ready) {
    mainWindow.webContents.send('file-open', fileToOpen)
    fileToOpen = null
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
