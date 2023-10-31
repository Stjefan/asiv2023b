import { ElectronHandler, ElectronHandler1 } from '../main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler;
    electronStuff: ElectronHandler1;
  }
}

export {};
