import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { getRxStorageIpcRenderer } from 'rxdb/plugins/electron';
import { getRxStorageLoki } from 'rxdb/plugins/storage-lokijs';
import { RxDatabase } from 'rxdb';
import { Button } from 'primereact/button';

import React, { useContext, useEffect, useState } from 'react';
import {
  PrimeReactProvider,
  PrimeReactContext,
  FilterMatchMode,
  Filter,
} from 'primereact/api';
import icon from '../../assets/icon.svg';
import './App.css';
import { generateArbeitsplatz, getDatabase } from './database';
import 'primereact/resources/themes/bootstrap4-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

import { TableView } from './table';
import { TreeView } from './tree';
import { ConfirmDialog } from 'primereact/confirmdialog';
import {
  ImportDialog,
  EditDialog,
  DumpDialog,
  ShowVersionDialog,
  MessungenExportDialog,
  LoadingDialog,
  DatenbankChangeDialog,
} from './dialogs';

import {
  locale,
  addLocale,
  updateLocaleOption,
  updateLocaleOptions,
  localeOption,
  localeOptions,
} from 'primereact/api';
import * as de from './de.json';

addLocale('de', de);
locale('de');

const storage = getRxStorageIpcRenderer({
  key: 'main-storage',
  statics: getRxStorageLoki({}).statics,
  // statics: getRxStorageMemory().statics,
  ipcRenderer: (window as any).electronStuff.ipcRenderer,
  mode: 'storage',
});

function MainView() {
  const context = useContext(ASIVContext);
  const {
    db,
    setDb,
    setShowVersionDialog,
    selectFile,
    databaseFile,
    loadDatabse,
    setDatabaseFile,
  } = context;

  useEffect(() => {
    try {
      const pathFromLocalStorage = localStorage.getItem('pathDatabase');
      console.log(
        'Trying to load last selected database from',
        pathFromLocalStorage,
      );
      if (pathFromLocalStorage) {
        getDatabase(pathFromLocalStorage, storage)
          .then((arg) => {
            console.log('Setting database', arg);
            setDb(arg);
            setDatabaseFile(pathFromLocalStorage);
            return 0;
          })
          .catch((ex) => console.error(ex));
      }
    } catch (ex) {
      console.error(ex);
    }
  }, []);

  function getVersion() {
    console.log(window.electronStuff.getVersion());
    window.electronStuff.ipcRenderer.once(
      'current-version',
      (arg1: any, arg2: any) => {
        console.log('args', arg1, arg2);
        setShowVersionDialog(true);
      },
    );
  }

  function handleConfirm() {
    console.log('Hello');
  }

  const [showChangeDatabase, setShowChangeDatabase] = useState(false);
  return (
    <div>
      <h1>Arbeitsplatz-Schallimmissions-Verwaltung</h1>
      <div className="Hello">
        <Button
          label={databaseFile ? 'Datenbank wechseln' : 'Datenbank erstellen'}
          onClick={() => setShowChangeDatabase(true)}
        />
        {/* <Button
          type="button"
          onClick={selectFile}
          label="Datenbank-Datei wählen"
        /> */}
        {databaseFile && (
          <p>
            Pfad zur aktuell ausgewählten Datenbank: <br /> {databaseFile}
          </p>
        )}
        {/* <Button type="button" onClick={loadDatabse} label="Datenbank erstellen" /> */}
        <Button label="Version" type="button" onClick={getVersion} />
        <TableView />
        <TreeView />
        <ImportDialog />
        <EditDialog header="Eingabe" handleConfirm={handleConfirm} />
        <DumpDialog />
        <ConfirmDialog />
        <MessungenExportDialog />
        <ShowVersionDialog />
        <LoadingDialog />
        <DatenbankChangeDialog
          showDialog={showChangeDatabase}
          setShowDialog={setShowChangeDatabase}
        />
      </div>
    </div>
  );
}

type ASIVContextType = {
  db?: any;
  setDb: React.Dispatch<React.SetStateAction<any>>;
};
export const ASIVContext = React.createContext<ASIVContextType | undefined>(
  undefined,
);
export default function App() {
  // window.electron.ipcRenderer.sendMessage('ipc-example', ['from app']);
  const [db, setDb] = useState<any | null>(null);
  const [edit, setEdit] = useState<any | null>(null);
  const [dialogEdit, setDialogEdit] = useState<any | null>(null);
  const [dialogImport, setDialogImport] = useState<any | null>(null);
  const [dialogExport, setDialogExport] = useState<any | null>(null);
  const [dialogDump, setDialogDump] = useState<any | null>(null);
  const [showVersionDialog, setShowVersionDialog] = useState<any | null>(null);
  const [showLoadingDialog, setShowLoadingDialog] = useState<any | null>(null);

  const [messungenExport, setMessungenExport] = useState<any[] | null>(null);

  const [databaseFile, setDatabaseFile] = useState(null as string | null);

  function selectFile() {
    window.electronStuff.openFileDialog();
    window.electronStuff.ipcRenderer.once(
      'selected-file',
      (event: any, path: string) => {
        console.log('File path:', path, event);
        localStorage.setItem('pathDatabase', path);
        setDatabaseFile(path);
      },
    );
  }

  async function loadDatabse() {
    console.log(window);
    if (databaseFile) {
      const _db = await getDatabase(
        databaseFile, // 'heroes',
        // "heroesdb" + dbSuffix, // we add a random timestamp in dev-mode to reset the database on each start
        storage,
      );
      console.log(storage, _db);
      setDb(_db);
    }
  }

  const primeReactProviderValue = {
    filterMatchMode: {
      text: [
        FilterMatchMode.STARTS_WITH,
        FilterMatchMode.CONTAINS,
        FilterMatchMode.NOT_CONTAINS,
        FilterMatchMode.ENDS_WITH,
        FilterMatchMode.EQUALS,
        FilterMatchMode.NOT_EQUALS,
      ],
      numeric: [
        FilterMatchMode.EQUALS,
        FilterMatchMode.NOT_EQUALS,
        FilterMatchMode.LESS_THAN,
        FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
        FilterMatchMode.GREATER_THAN,
        FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
      ],
      date: [
        FilterMatchMode.DATE_IS,
        FilterMatchMode.DATE_IS_NOT,
        FilterMatchMode.DATE_BEFORE,
        FilterMatchMode.DATE_AFTER,
      ],
    },
  };

  return (
    <PrimeReactProvider value={primeReactProviderValue}>
      <ASIVContext.Provider
        value={{
          db,
          setDb,
          edit,
          setEdit,
          dialogEdit,
          setDialogEdit,
          dialogImport,
          setDialogImport,
          dialogExport,
          setDialogExport,
          dialogDump,
          setDialogDump,

          messungenExport,
          setMessungenExport,

          showVersionDialog,
          setShowVersionDialog,

          setShowLoadingDialog,
          showLoadingDialog,

          databaseFile,
          loadDatabse,
          setDatabaseFile,
          selectFile,
        }}
      >
        <Router>
          <Routes>
            <Route path="/" element={<MainView />} />
          </Routes>
        </Router>
      </ASIVContext.Provider>
    </PrimeReactProvider>
  );
}
