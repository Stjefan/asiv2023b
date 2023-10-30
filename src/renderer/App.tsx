import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { getRxStorageIpcRenderer } from 'rxdb/plugins/electron';
import { getRxStorageLoki } from 'rxdb/plugins/storage-lokijs';
import { RxDatabase } from 'rxdb';

import icon from '../../assets/icon.svg';
import './App.css';
import { generateArbeitsplatz, getDatabase } from './database';

function Hello() {
  let db: RxDatabase | null = null;
  async function foo() {
    console.log(window);
    const storage = getRxStorageIpcRenderer({
      key: 'main-storage',
      statics: getRxStorageLoki({}).statics,
      // statics: getRxStorageMemory().statics,
      ipcRenderer: (window as any).electronStuff.ipcRenderer,
      mode: 'storage',
    });
    db = await getDatabase(
      'heroes',
      // "heroesdb" + dbSuffix, // we add a random timestamp in dev-mode to reset the database on each start
      storage,
    );
    console.log(storage, db);
  }

  function bar() {
    window.electron.ipcRenderer.sendMessage('ipc-example', ['from button']);
  }

  async function insert() {
    console.log(db);
    const r = await db.arbeitsplatzmessungen.insert(generateArbeitsplatz());
    console.log(r);
  }

  async function read() {
    db.arbeitsplatzmessungen.find().$.subscribe((heroes: any[]) => {
      if (!heroes) {
        return;
      }
      console.log('observable fired');
      console.dir(heroes, db);
    });
  }

  return (
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <div className="Hello">
        Hello
        <button type="button" onClick={foo}>
          Database
        </button>
        <button type="button" onClick={bar}>
          Click
        </button>
        <button type="button" onClick={insert}>
          Insert
        </button>
        <button type="button" onClick={read}>
          Read
        </button>
      </div>
    </div>
  );
}

export default function App() {
  // window.electron.ipcRenderer.sendMessage('ipc-example', ['from app']);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
