// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent, app } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

// contextBridge.exposeInMainWorld('electron', electronHandler);

(window as any).electronStuff = {
  ipcRenderer,
  openFileDialog: () => ipcRenderer.send('open-file-dialog'),
  selectFile: () => ipcRenderer.send('file-select'),
  getVersion: () => ipcRenderer.send('get-version'),
};

const electronHandler1 = {
  ipcRenderer,
  openFileDialog: () => ipcRenderer.send('open-file-dialog'),
  selectFile: () => ipcRenderer.send('file-select'),
  getVersion: () => ipcRenderer.send('get-version'),
};

export type ElectronHandler1 = typeof electronHandler1;
export type ElectronHandler = typeof electronHandler;
