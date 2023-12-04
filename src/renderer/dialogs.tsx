import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import React, { useContext, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';

import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton';

import { Dialog } from 'primereact/dialog';
import * as MapperImport from './excel/ASIV Import.json';

import { ASIVContext } from './App';
import { FlexboxForm } from './createMessung';
import { blob2uint8, importExcel } from './useExcel';
import { runExcelExport, runExcelBackup } from './excelReport';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Calendar } from 'primereact/calendar';

interface Category {
  name: string;
  key: string;
}

export function DynamicDemo({
  categories,
  selectedCategory,
  setSelectedCategory,
  ...props
}) {
  return (
    <div className="card flex justify-content-center">
      <p>Vorlage auswählen:</p>
      <div className="flex flex-column">
        {categories.map((category) => {
          return (
            <div key={category.key} className="flex align-items-center">
              <RadioButton
                inputId={category.key}
                name="category"
                value={category}
                onChange={(e: RadioButtonChangeEvent) =>
                  setSelectedCategory(e.value)
                }
                checked={selectedCategory.key === category.key}
              />
              <label htmlFor={category.key} className="ml-2">
                {category.name}
              </label>
            </div>
          );
        })}
      </div>
      <div className="flex flex-column gap-2">
      <InputText placeholder='Bearbeiter' aria-describedby="username-help"/>
      <small id="username-help">
        Eintragener Name des Bearbeiters
    </small>
      </div>
      <div className="flex flex-column gap-2">
    <Calendar aria-describedby="username-help" placeholder='Datum'/>
    <small id="username-help">
       Im Datumsfeld in der Vorlage eingetragener Wert.
    </small>
    </div>
    </div>

  );
}

export function Dialog1() {
  const toast = useRef(null);

  const accept = () => {
    toast.current.show({
      severity: 'info',
      summary: 'Confirmed',
      detail: 'You have accepted',
      life: 3000,
    });
  };

  const reject = () => {
    toast.current.show({
      severity: 'warn',
      summary: 'Rejected',
      detail: 'You have rejected',
      life: 3000,
    });
  };

  const confirm1 = () => {
    confirmDialog({
      message: 'Are you sure you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept,
      reject,
    });
  };

  const confirm2 = () => {
    confirmDialog({
      message:
        'Soll die Messung archiviert werden. Dies kann nicht rückgängig gemacht werden.',
      header: 'Archvierung bestätigen',
      icon: 'pi pi-info-circle',
      acceptClassName: 'p-button-danger',
      accept,
      reject,
    });
  };

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="card flex flex-wrap gap-2 justify-content-center">
        <Button
          onClick={confirm1}
          icon="pi pi-check"
          label="Confirm"
          className="mr-2"
        />
        <Button onClick={confirm2} icon="pi pi-times" label="Delete" />
      </div>
    </>
  );
}

export function MessungenExportDialog({ handleConfirm, ...props }) {
  const context = useContext(ASIVContext);
  const { setDialogExport, dialogExport, showLoadingDialog, setShowLoadingDialog } = context;

  const { messungenExport } = context;
  const categories = [
    { name: 'Abteilung', key: 'A' },
    { name: 'Kostenstelle', key: 'M' },
    { name: 'Gebäude / Etage', key: 'P' },
    { name: 'Ausgabe SMP (altern.)', key: 'Alt' },
    { name: 'Standard', key: 'S' },
  ];
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    categories[1],
  );

  const footerContent = (
    <div>
      <Button
        label="Abbrechen"
        icon="pi pi-times"
        onClick={() => setDialogExport(false)}
        className="p-button-text"
      />
      <Button
        label="Exportieren"
        icon="pi pi-check"
        onClick={() => {
          try {
            if (messungenExport) {
              console.log("???")
              setShowLoadingDialog(true)
              runExcelExport(messungenExport, selectedCategory.name).catch(err => console.error(err)).finally(_ => setShowLoadingDialog(false))
              // runExcelExport(messungenExport, selectedCategory.name);
            } else {
              throw new Error('Bitte Messungen in der Tabelle auswählen');
            }
          } finally {
            setDialogExport(false);
            // setShowLoadingDialog(false)
          }
        }}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header="Export ausgewählter Messungen"
      visible={dialogExport}
      style={{ width: '50vw' }}
      onHide={() => setDialogExport(false)}
      footer={footerContent}
    >
      <DynamicDemo
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </Dialog>
  );
}

export function ImportDialog() {
  const toast = useRef(null);
  const context = useContext(ASIVContext);

  const { setDialogImport, dialogImport, db } = context;

  const [file, setFile] = useState(null);
  // const [visible, setVisible] = useState(false);
  const footerContent = (
    <div>
      <Button
        label="Zurück"
        icon="pi pi-times"
        onClick={() => setDialogImport(false)}
        className="p-button-text"
      />
      <Button
        label="Importieren"
        icon="pi pi-check"
        onClick={() => runImport()}
        autoFocus
      />
    </div>
  );

  async function runImport() {
    const b = await blob2uint8(file);
    const results = await importExcel(b, MapperImport, startLine, sheetName);
    console.log(results);

    Promise.all(results.map((r: any) => db.arbeitsplatzmessungen.insert(r)))
      .then((_) => {
        console.log(_);
        toast.current.show({
          severity: 'info',
          summary: 'Import erfolgreich',
          detail: `Es wurden ${results.length} Messungen importiert`,
          life: 3000,
        });
      })
      .catch((ex) => {
        console.error(ex);
        toast.current.show({
          severity: 'error',
          summary: 'Import fehlgeschlagen',
          detail: `${ex}`,
          life: 3000,
        });
      });
  }

  const [startLine, setStartLine] = useState(8);
  const [sheetName, setSheetName] = useState('ASIV Export');

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast} />
      {/* <Button
        label="Datenbank aus Excel-File importieren"
        icon="pi pi-external-link"
        onClick={() => setDialogImport(true)}
      /> */}
      <Dialog
        header="Import aus Excel-File"
        visible={dialogImport}
        style={{ width: '50vw' }}
        onHide={() => setDialogImport(false)}
        footer={footerContent}
      >
        <div>
          <label>Datei auswählen</label>
          <input
            type="file"
            onInput={(event) =>
              (event.target as any).files
                ? setFile((event.target as any).files[0])
                : setFile(null)
            }
          />
          <br />
          <label>Excel-Sheet-Bezeichnung:</label>
          <InputText
            onInput={(e) => setSheetName(e.target.value)}
            value={sheetName}
          />
          <br />
          <label>Zeilennummer der ersten Datenzeile:</label>
          <InputNumber
            onChange={(e) => setStartLine(e.value)}
            value={startLine}
          />
          <br />
        </div>
      </Dialog>
    </div>
  );
}

export function EditDialog({ header, handleConfirm, ...props }) {
  const context = useContext(ASIVContext);

  const { setDialogEdit, dialogEdit } = context;
  // const [visible, setVisible] = useState(false);
  const footerContent = (
    <div>
      <Button
        label="Abbrechen"
        icon="pi pi-times"
        type="button"
        onClick={() => setDialogEdit(false)}
        className="p-button-text"
      />
      <Button
        label="Speichern"
        icon="pi pi-check"
        type="submit"
        onClick={() => {
          console.log(flexRef.current);
          console.log(flexRef.current?.submitInForm());
          handleConfirm();
          // setDialogEdit(false)}
        }}
        autoFocus
      />
    </div>
  );

  const flexRef = useRef();
  return (
    <div className="card flex justify-content-center">
      {/* <Button
        label="Datenbank aus Excel-File importieren"
        icon="pi pi-external-link"
        onClick={() => setDialogEdit(true)}
      /> */}
      <Dialog
        header={header}
        visible={dialogEdit}
        style={{ width: '85vw' }}
        onHide={() => setDialogEdit(false)}
        footer={footerContent}
      >
        <FlexboxForm ref={flexRef} />
      </Dialog>
    </div>
  );
}

export function DumpDialog() {
  const context = useContext(ASIVContext);

  const { setDialogDump, dialogDump, db,  setShowLoadingDialog, showLoadingDialog } = context;


  const footerContent = (
    <div>
      <Button
        label="Nein"
        icon="pi pi-times"
        onClick={() => setDialogDump(false)}
        className="p-button-text"
      />
      <Button
        label="Ja"
        icon="pi pi-check"
        onClick={async () => {
          const rows = (await db.arbeitsplatzmessungen.find().exec()).map(
            (i) => {
              const asJSON = i.toJSON();
              return {
                ...asJSON,
                updatedAt: new Date(asJSON.updatedAt),
                createdAt: new Date(asJSON.updatedAt),
                messdatum: new Date(asJSON.messdatum),
                archiviert: asJSON.archiviert == 1,
                // updatedAt: new Date("2015-06-15")
              };
            },
          );
          setShowLoadingDialog(true)
          runExcelBackup(rows).catch(ex => console.error(ex)).finally(() => setShowLoadingDialog(false));
          setDialogDump(false);
        }}
        autoFocus
      />
    </div>
  );

  return (
    <div className="card flex justify-content-center">
      <Dialog
        header="Datenbank Export"
        visible={dialogDump}
        style={{ width: '50vw' }}
        onHide={() => setDialogDump(false)}
        footer={footerContent}
      >
        Der Datenbankinhalt wird als Excel-File exportiert. Dies dient vorallem
        zur Datensicherung. Fortfahren?
      </Dialog>
    </div>
  );
}

export function ShowVersionDialog() {
  const context = useContext(ASIVContext);

  const { setShowVersionDialog, showVersionDialog } = context;

  const footerContent = (
    <div>
      <Button
        label="Zurück"
        icon="pi pi-times"
        onClick={() => setShowVersionDialog(false)}
        className="p-button-text"
      />
    </div>
  );

  return (
    <div className="card flex justify-content-center">
      <Dialog
        header="Versionsinformation"
        visible={showVersionDialog}
        style={{ width: '50vw' }}
        onHide={() => setShowVersionDialog(false)}
        footer={footerContent}
      >
        <p>Die vorliegende Version lautet:</p>
        <p>{process.env.npm_package_version}</p>
      </Dialog>
    </div>
  );
}

export function DatenbankChangeDialog({
  showDialog,
  setShowDialog,
  ...props
}: any) {
  const context = useContext(ASIVContext);
  const {
    db,
    setDb,
    setShowVersionDialog,
    selectFile,
    databaseFile,
    loadDatabse,
  } = context;

  return (
    <Dialog
      header="Datenbank wechseln"
      visible={showDialog}
      footer={
        <>
          <Button label="Zurück" onClick={() => setShowDialog(false)} />
        </>
      }
      onHide={() => {
        console.log('Hiding...');
        setShowDialog(false);
      }}
    >
      <ul>
        <li>
          {' '}
          <p>Ordner auswählen: </p>{' '}
          <p>
            Ordner, in dem eine existierende Datenbank liegt oder eine neue Datenbank erstellt werden soll. Die Datenbank besteht aus
            mehreren Dateien, deshalb empfiehlt sich ein eigener Ordner.
          </p>{' '}
          <Button
            type="button"
            onClick={selectFile}
            label="Datenbank-Datei wählen"
          />
        </li>
        <li>
          <p>Datenbank laden (oder erstellen, falls keine Datenbank im Ordner vorhanden ist){' '}:</p>
          <Button
            type="button"
            onClick={loadDatabse}
            label="Datenbank erstellen"
          />
        </li>
      </ul>
    </Dialog>
  );
}


export function LoadingDialog() {
  const context = useContext(ASIVContext);

  const { setShowLoadingDialog, showLoadingDialog } = context;
  return (
    <div>
      <Dialog
        header="ASIV lädt"
        visible={showLoadingDialog}
        closable={false}
        style={{ width: '50vw' }}
        onHide={() => setShowLoadingDialog(false)}
      >
        <ProgressSpinner />
      </Dialog>
    </div>
  );
}
