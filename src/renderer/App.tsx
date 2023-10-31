import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { getRxStorageIpcRenderer } from 'rxdb/plugins/electron';
import { getRxStorageLoki } from 'rxdb/plugins/storage-lokijs';
import { RxDatabase } from 'rxdb';
import { Button } from 'primereact/button';

import icon from '../../assets/icon.svg';
import './App.css';
import { generateArbeitsplatz, getDatabase } from './database';
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

import { useContext, useState } from 'react';
import { TableView } from './table';
import React from 'react';
import { PrimeReactProvider, PrimeReactContext } from "primereact/api";

console.log("GOGO")
function Hello() {
  const context = useContext(ASIVContext);
  const { db, setDb } = context;
  const [databaseFile, setDatabaseFile] = useState(null as string | null);
  async function foo() {
    console.log(window);
    if (databaseFile) {
      const storage = getRxStorageIpcRenderer({
        key: 'main-storage',
        statics: getRxStorageLoki({}).statics,
        // statics: getRxStorageMemory().statics,
        ipcRenderer: (window as any).electronStuff.ipcRenderer,
        mode: 'storage',
      });
      const _db = await getDatabase(
        databaseFile, // 'heroes',
        // "heroesdb" + dbSuffix, // we add a random timestamp in dev-mode to reset the database on each start
        storage,
      );
      console.log(storage, _db);
      setDb(_db)
    }
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

    });
  }

  function getVersion() {
    console.log(window.electronStuff.getVersion());
    window.electronStuff.ipcRenderer.once(
      'current-version',
      (arg1: any, arg2: any) => {
        console.log('args', arg1, arg2);
      },
    );
  }

  function selectFile() {
    window.electronStuff.openFileDialog();
    window.electronStuff.ipcRenderer.once(
      'selected-file',
      (event: any, path: string) => {
        console.log('File path:', path, event);
        setDatabaseFile(path);
      },
    );
  }

  return (
    <div>
      <h1>ASIV</h1>
      <div className="Hello">
        <Button
          type="button"
          onClick={selectFile}
          label="Datenbank-Datei wählen"
        />
        {databaseFile && <p>Pfad zur Datenbank {databaseFile}</p>}
        <Button type="button" onClick={foo} label="Datenbank erstellen" />
        <Button type="button" onClick={bar} label="Click" />

        <Button
          type="button"
          onClick={insert}
          label="Arbeitsplatzmessung anlegen"
        />
        <Button type="button" onClick={read} label="Datenbank auslesen" />
        <Button label="Version" type="button" onClick={getVersion} />
        <TableView/>
      </div>
    </div>
  );
}


type ASIVContextType = {
  db?: any;
  setDb: React.Dispatch<React.SetStateAction<any>>;
}
export const ASIVContext = React.createContext<ASIVContextType | undefined>(
  undefined
);
export default function App() {
  // window.electron.ipcRenderer.sendMessage('ipc-example', ['from app']);
  const [db, setDb] = useState<any | null>(null);

  return (
    <PrimeReactProvider>
    <ASIVContext.Provider value={{db, setDb}}>
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
    </ASIVContext.Provider>
    </PrimeReactProvider>
  );
}
