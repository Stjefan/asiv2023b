import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { getRxStorageIpcRenderer } from 'rxdb/plugins/electron';
import { getRxStorageLoki } from 'rxdb/plugins/storage-lokijs';
import { RxDatabase } from 'rxdb';
import { Button } from 'primereact/button';

import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  PrimeReactProvider,
  PrimeReactContext,
  FilterMatchMode,
  Filter,
  locale,
  addLocale,
  updateLocaleOption,
  updateLocaleOptions,
  localeOption,
  localeOptions,
} from 'primereact/api';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import icon from '../../assets/icon.svg';
import './App.css';
import { generateArbeitsplatz, getDatabase } from './database';
import 'primereact/resources/themes/bootstrap4-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';

import { TableView } from './table';
import { TreeView } from './tree';
import { ExperimentalDialog } from './experimental';
import {
  ImportDialog,
  EditDialog,
  DumpDialog,
  ShowVersionDialog,
  MessungenExportDialog,
  LoadingDialog,
  DatenbankChangeDialog,
} from './dialogs';
import { Card } from 'primereact/card';
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
  } = context!;

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

  window.electronStuff.ipcRenderer.on(
    'open-general-information',
    (event, data) => {
      console.log('Function was invoked');
      setShowVersionDialog(true);
    },
  );

  window.electronStuff.ipcRenderer.on(
    'open-database-selection',
    (event, data) => {
      setShowChangeDatabase(true);
    },
  );


  const [showChangeDatabase, setShowChangeDatabase] = useState(false);

  const [showExperimentalDialog, setShowExperimentalDialog] = useState(false);
  return (
    <div>
      <h1>Arbeitsplatz-Schallimmissions-Verwaltung</h1>
      <Card title="Hinweise">
    <p className="m-0">
      <ul>
        <li>Auf Menü in der Taskleite clicken</li>
        <li>Im Menü auf "Datenbank auswählen" drücken</li>
        <li>Im Dialog "Neue Datenbank erstellen" wählen</li>
        <li>Datenbank laden anclicken</li>
      </ul>
      <ul>
        <li>Exporte einer großen Anzahl an Messugen ({">>"}100) dauern relativ lange, ausgenommen ist der Export der Datenbank</li>
        <li>Einstellungen der angezeigten Spalten werden in der Datenbank hinterlegt, d.h. ein ändern der Datenbank erfordert auch das neue Einstellen der angezeigten Spalten</li>
        <li>Aktuell keine Speicherung der Spaltenreihenfolge möglich</li>
        <li>...</li>

      </ul>
    </p>
</Card>
      <div>
        {/* <Button
          label={databaseFile ? 'Datenbank wechseln' : 'Datenbank erstellen'}
          onClick={() => setShowChangeDatabase(true)}
        /> */}
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
        <TableView />
        <TreeView />
        <ImportDialog />
        <EditDialog header="Eingabe" />
        <DumpDialog />
        <ConfirmDialog />
        <MessungenExportDialog />
        <ShowVersionDialog />
        <LoadingDialog />
        {process.env.NODE_ENV === "development" &&
        <ExperimentalDialog
          showDialog={showExperimentalDialog}
          setShowDialog={setShowExperimentalDialog}
        />
        }
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
  dialogEdit: boolean;
  setDialogEdit: React.Dispatch<React.SetStateAction<boolean>>;
  edit: any;
  setEdit: React.Dispatch<any>;
  showLoadingDialog: boolean;
  setShowLoadingDialog: React.Dispatch<React.SetStateAction<boolean>>;
  databaseFile: any;
  setDatabaseFlile: React.Dispatch<any>;
};
export const ASIVContext = React.createContext<ASIVContextType | undefined>(
  undefined,
);
export default function App() {
  // window.electron.ipcRenderer.sendMessage('ipc-example', ['from app']);
  const [db, setDb] = useState<any | null>(null);
  const [edit, setEdit] = useState<any | null>(null);
  const [dialogEdit, setDialogEdit] = useState(false);
  const [dialogImport, setDialogImport] = useState<any | null>(null);
  const [dialogExport, setDialogExport] = useState<any | null>(null);
  const [dialogDump, setDialogDump] = useState<any | null>(null);
  const [showVersionDialog, setShowVersionDialog] = useState<any | null>(null);
  const [showLoadingDialog, setShowLoadingDialog] = useState<any | null>(null);

  const [messungenExport, setMessungenExport] = useState<any[]>([]);

  const [databaseFile, setDatabaseFile] = useState(null as string | null);

  const toast = useRef(null);

  async function getDocById(id: string) {
    const node = await db.arbeitsplatzmessungen.findOne(id).exec();
    console.log('Ergebnis', node);
    return node._data;
  }

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
    if (databaseFile) {
      const loadedDatabase = await getDatabase(
        databaseFile, // 'heroes',
        // "heroesdb" + dbSuffix, // we add a random timestamp in dev-mode to reset the database on each start
        storage,
      );
      setDb(loadedDatabase);
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
          toast,
          getDocById,
        }}
      >
        <Toast ref={toast} />
        <Router>
          <Routes>
            <Route path="/" element={<MainView />} />
          </Routes>
        </Router>
      </ASIVContext.Provider>
    </PrimeReactProvider>
  );
}
