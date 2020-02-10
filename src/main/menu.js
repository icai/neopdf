// 这里是定义菜单的地方，详情请查看 https://electronjs.org/docs/api/menu
const { dialog } = require('electron')

export default (win) => {
  const menu = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open...',
          id: 'file-open',
          accelerator: 'CmdOrCtrl+O',
          click() {
            dialog.showOpenDialog(win, {
              properties: ['openFile'],
              filters: [
                { name: 'PDF Files', extensions: ['pdf'] }
              ]
            }, (filename) => {
              if (filename) {
                win.webContents.send('file-open',
                  filename.toString())
              }
            })
          }
        },
        {
          label: 'Print...',
          id: 'file-print',
          accelerator: 'CmdOrCtrl+P',
          enabled: false,
          click() {
            win.webContents.send('file-print')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Properties...',
          id: 'file-properties',
          enabled: false,
          click() {
            win.webContents.send('file-properties')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Close',
          id: 'file-close',
          enabled: false,
          click() {
            win.webContents.send('file-close')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Reload',
          accelerator: 'F5',
          role: 'reload'
        }, {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+F4',
          role: 'close'
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [{
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      }, {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      }]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle fullscreen',
          id: 'view-fullscreen',
          enabled: false,
          accelerator: 'F11',
          click() {
            win.webContents.send('view-fullscreen')
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Development mode',
          accelerator: 'CmdOrCtrl+I',
          role: 'toggledevtools'
        },
        {
          label: 'About',
          id: 'about'
        }
      ]
    }]
  return menu
}
