import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { getRxStorageIpcRenderer } from 'rxdb/plugins/electron';
import { getRxStorageLoki } from 'rxdb/plugins/storage-lokijs';

import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  PrimeReactProvider,
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

import 'primereact/resources/themes/bootstrap4-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import { Panel } from 'primereact/panel';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'primeicons/primeicons.css';

import icon from '../../assets/icon.svg';
import './App.css';
import { generateArbeitsplatz, getDatabase } from './database';
import * as de from './de.json';
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
import { ERFOLG_DATENBANKWECHSEL, FEHLER_SETTINGS } from './messages';

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

  const markdown = `
### Schnellstart:
1. **Allgemein** in der Menüleiste ausklappen
1. Im ausgeklappen Menü **Datenbank wechseln / erstellen** auswählen
1. Im auftretenden Dialog ***Datenbank-Datei wählen** drücken und einen passenden Ordner aussuchen
1. Ein erfolgreicher Datenbankwechsel (oder eine Neuerstellung bei nicht vorhandener Datenbank im Ordner) wird über eine Benachrichtigung bestätigt
1. Anschließend den Dialog mit **Zurück zum Hauptbildschirm** beenden

### Quick-Fix:
1. Bei unvorhergesehenen Fehlermeldungen, bei denen keine weitere Aktion mehr möglich ist, hilft es möglicherweise unter **Allgemein** in der Menüleiste auf **Neuladen** zu drücken (STRG+R)

### Bekannte Probleme:
- Exporte einer großen Anzahl an Messugen (d.h. >> 100) dauern relativ lange, ausgenommen ist der Export der Datenbank
- Einstellungen der angezeigten Spalten werden in der Datenbank hinterlegt, d.h. ein ändern der Datenbank erfordert auch das neue Einstellen der angezeigten Spalten
- Aktuell keine Speicherung der Spaltenreihenfolge möglich
- Ungefilterte Massenauswahl in der Tabelle (d.h. >> 1000) führt zu langen Wartezeiten:
  - Beispiel: Auswahl von 4000 Messugen bremst System ca. 30sec
- Feld **createdAt** wird bei jedem Speichern geupdated
`;
  const ref = useRef(null);
  return (
    <div>
      <h1>Arbeitsplatz-Schallimmissions-Verwaltung</h1>
      <Panel ref={ref} header="Hinweise" toggleable collapsed={!databaseFile}>
        {databaseFile && (
          <p>
            Pfad zur aktuell ausgewählten Datenbank: <br /> {databaseFile}
          </p>
        )}
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </Panel>
      <div className="p-4">
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
          <>
            <TableView />
            <TreeView />
          </>
        )}
        {!databaseFile && <div>Bitte zuerst eine Datenbank erstellen</div>}

        <ImportDialog />
        <EditDialog header={"Eingabe Arbeitsplatzmessung"} />
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

  useEffect(() => {
    async function loadDatabase(databaseDirectory) {
      console.log('In loadDatabase');
      if (databaseFile) {
        const loadedDatabase = await getDatabase(
          databaseDirectory,
          storage,
        );
        setDb(loadedDatabase);
        console.log('Loaded Database');
        toast.current?.show(ERFOLG_DATENBANKWECHSEL);
      }
    }
    loadDatabase(databaseFile);
    return () => 0
  }, [databaseFile]);



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
