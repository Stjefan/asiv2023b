import React, { useState, useEffect, useContext } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { Button } from 'primereact/button';
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect';
import { Toolbar } from 'primereact/toolbar';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { ASIVContext } from './App';
import { ContextMenu } from 'primereact/contextmenu';
import { Toast } from 'primereact/toast';

export function AnotherView() {
  return <div>Another</div>;
}

export const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = (1 + date.getMonth()).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface ColumnMeta {
  field: string;
  header: string;
  type: string;
}
const columns: ColumnMeta[] = [
  { header: 'Letzte Änderung', field: 'updatedAt', type: 'date' },
  { header: 'Erstellt', field: 'createdAt', type: 'date' },
  { header: 'ID', field: 'id', type: 'text' },
  { header: 'Archiviert', field: 'archiviert', type: 'boolean' },

  { header: 'Jahr', field: 'protokolljahr', type: 'numeric' },
  { header: 'Protokollnummer', field: 'protokollnummer', type: 'text' },
  {
    header: 'Schallpegelmessblatt',
    field: 'schallpegelmessblatt',
    type: 'text',
  },
  { header: 'Auftrags-Nr.', field: 'auftragsnummer', type: 'text' },

  { header: 'Werksteil', field: 'werkteil', type: 'text' },
  { header: 'Werknummer', field: 'werknummer', type: 'text' },
  { header: 'Gebäude', field: 'gebaeude', type: 'text' },
  { header: 'Etage', field: 'etage', type: 'text' },

  { header: 'Abteilung', field: 'abteilung', type: 'text' },
  { header: 'Kostenstelle', field: 'kostenstelle', type: 'text' },

  { header: 'Datum', field: 'messdatum', type: 'date' },
  { header: 'Messgerät', field: 'messgeraet', type: 'text' },
  { header: 'Bearbeiter', field: 'bearbeiter', type: 'text' },

  { header: 'Arbeitsplatznummer', field: 'arbeitsplatznummer', type: 'text' },
  { header: 'Schichtmodell', field: 'schichtmodell', type: 'text' },
  {
    header: 'Anzahl AK/Schicht',
    field: 'arbeitskraefteproschicht',
    type: 'numeric',
  },
  {
    header: 'Tätigkeit (Zeile 1)',
    field: 'taetigkeitsbeschreibung1',
    type: 'text',
  },
  {
    header: 'Tätigkeit (Zeile 2)',
    field: 'taetigkeitsbeschreibung2',
    type: 'text',
  },
  {
    header: 'Tätigkeit (Zeile 3)',
    field: 'taetigkeitsbeschreibung3',
    type: 'text',
  },
  { header: 'Messort (Zeile 1)', field: 'messort1', type: 'text' },
  { header: 'Messort (Zeile 2)', field: 'messort2', type: 'text' },
  { header: 'Messort (Zeile 3)', field: 'messort3', type: 'text' },
  { header: 'Kommentar (Zeile 1)', field: 'kommentar1', type: 'text' },
  { header: 'Kommentar (Zeile 2)', field: 'kommentar2', type: 'text' },
  { header: 'Kommentar (Zeile 3)', field: 'kommentar3', type: 'text' },

  { header: 'Lärmexpositionspegel Lex', field: 'lex', type: 'numeric' },
  { header: 'Beurteilungszeit', field: 'beurteilungszeit', type: 'numeric' },
  { header: 'Spitzenpegel LpCpeak', field: 'lcpeak', type: 'numeric' },
  { header: 'Genauigkeitsklasse', field: 'genauigkeitsklasse', type: 'text' },
];

export function TableView() {
  const [products, setProducts] = useState([]);
  const [messungenExport, setMessungenExport] = useState([])
  const [visibleColumns, setVisibleColumns] = useState<ColumnMeta[]>(columns);
  const context = useContext(ASIVContext);
  const { db, setDialogEdit, setDialogDump, setDialogExport, setDialogImport, setEdit } = context;

  const onColumnToggle = (event: MultiSelectChangeEvent) => {
    const selectedColumns = event.value;
    const orderedSelectedColumns = columns.filter((col) =>
      selectedColumns.some(
        (sCol: { field: string }) => sCol.field === col.field,
      ),
    );

    setVisibleColumns(orderedSelectedColumns);
  };

  useEffect(() => {
    if (db) {
      foo();
    } else {
      console.log('Empty effect');
    }
    // initFilters();
  }, [context]);

  function foo() {
    console.log('foo', db);
    const nodes = db.arbeitsplatzmessungen
      .find({
        selector: {
          // archiviert: true
        },
      })
      .$.subscribe((docs) => {
        const rows = docs.map((i) => {
          const asJSON = i.toJSON();
          return {
            ...asJSON,
            updatedAt: new Date(asJSON.updatedAt),
            createdAt: new Date(asJSON.updatedAt),
            messdatum: new Date(asJSON.messdatum),
            archiviert: asJSON.archiviert == 1,
            // updatedAt: new Date("2015-06-15")
          };
        });
        setProducts(rows);

        console.log(docs);
      });
  }

  const header = (
    <MultiSelect
      value={visibleColumns}
      options={columns}
      optionLabel="header"
      onChange={onColumnToggle}
      style={{ width: '300px' }}
      display="chip"
    />
  );

  const dateBodyTemplate = (rowData: any, additional: any, ...args: any) => {
    console.log(rowData, additional, args);
    return formatDateForInput(rowData[additional.field]);
  };

  const toast = React.useRef<Toast>(null);
  const cm = React.useRef<ContextMenu>(null);
  const menuModel = [
    {
      label: "Details anzeigen",
      icon: "pi pi-fw pi-search",
      command: () => {
        console.log(messungenExport);
        setEdit(messungenExport[0]);
        setDialogEdit(true);
      },
    },
    {
      label: "Archivieren",
      icon: "pi pi-fw pi-times",
      command: () => {
        console.log(messungenExport);
        archivereSelected();
      },
    },
  ];

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Neu"
          icon="pi pi-plus"
          severity="success"
          onClick={() => setDialogEdit(true)}
        />
        <Button
          label="Archivieren"
          icon="pi pi-trash"
          severity="danger"
          onClick={archivereSelected}
          disabled={!messungenExport || !messungenExport.length}
        />
        <Button
          label="Einstellungen speichern"
          icon="pi pi-pencil"
          onClick={() => saveSettings(visibleColumns)}
        />
        <Button
          label="Einstellungen laden"
          icon="pi pi-pencil"
          onClick={loadSettings}
        />
      </div>
    );
  };

  async function saveSettings(orderedSelectedColumns: any) {
    const localDoc = await db.upsertLocal(
      "orderedSelectedColumns", // id
      orderedSelectedColumns
    );
    console.log(localDoc);
  }

  async function loadSettings() {
    console.log("??");
    const localDoc = (await db.getLocal(
      "orderedSelectedColumns" // id
    )).toJSON();
    // const orderedSelectedColumns = columns.filter((col) =>
    // localDoc.some(
    //       (sCol: { field: string }) => sCol.field === col.field
    //     )
    //   );
    console.log(localDoc);
    const orderedSelectedColumns = columns.filter((col) =>
      localDoc.data.some(
        (sCol: { field: string }) => sCol.field === col.field
      )
    );


    setVisibleColumns(orderedSelectedColumns);
  }

  async function archivereSelected() {
    if (messungenExport.length) {
      console.log(
        db.arbeitsplatzmessungen
          .find({
            selector: { id: { $in: messungenExport.map((i) => i.id) } },
          })
          .update({
            $set: {
              archiviert: 1,
            },
          })
          .then((doc) => console.log(doc))
      );
    }
  }

  const rightToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Import"
          icon="pi pi-upload"
          className="p-button-help"
          onClick={() => setDialogImport(true)}
        />
        <Button
          label="Export"
          icon="pi pi-upload"
          className="p-button-help"
          onClick={() => setDialogExport(true)}
        />
        <Button
          label="Export der Datenbank"
          icon="pi pi-upload"
          className="p-button-help"
          onClick={() => setDialogDump(true)}
        />
      </div>
    );
  };

  return (
    <div>
            <ContextMenu model={menuModel} ref={cm} />

<Toolbar
  className="mb-4"
  left={leftToolbarTemplate}
  right={rightToolbarTemplate}
></Toolbar>
      <Button type="button" onClick={foo} label="Lade Daten" />
      <DataTable
        value={products}
        header={header}
        selectionMode="multiple"
        selection={messungenExport}
        onSelectionChange={(e) => setMessungenExport(e.value)}
        onContextMenu={(e) => cm.current.show(e.originalEvent)}
        resizableColumns
        reorderableColumns
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} bis {last} von {totalRecords}"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
        {visibleColumns.map((col) => {
          if (col.type == 'date') {
            return (
              <Column
                key={col.field}
                field={col.field}
                header={col.header}
                filter
                sortable
                dataType={col.type}
                body={dateBodyTemplate}
              />
            );
          }
          return (
            <Column
              key={col.field}
              field={col.field}
              header={col.header}
              dataType="text"
              filter
              sortable
            />
          );
        })}
      </DataTable>
    </div>
  );
}
