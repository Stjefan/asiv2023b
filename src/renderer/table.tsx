import React, { useState, useEffect, useContext } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { Button } from 'primereact/button';
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect';
import { Toolbar } from 'primereact/toolbar';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { ContextMenu } from 'primereact/contextmenu';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import { classNames } from 'primereact/utils';
import { Checkbox } from 'primereact/checkbox';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import { ASIVContext } from './App';
import { generateArbeitsplatz } from './database';
import { arrayToObject } from './utility';
import { FEHLER_SETTINGS } from './messages';
import { confirmDialog } from 'primereact/confirmdialog';

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

  const [visibleColumns, setVisibleColumns] = useState<ColumnMeta[]>(columns);
  const context = useContext(ASIVContext);
  const {
    db,
    setDialogEdit,
    setDialogDump,
    setDialogExport,
    setDialogImport,
    setEdit,
    messungenExport,
    setMessungenExport,
    showLoadingDialog,
    setShowLoadingDialog,
    toast
  } = context!;

  const onColumnToggle = (event: MultiSelectChangeEvent) => {
    const selectedColumns = event.value;
    const orderedSelectedColumns = columns.filter((col) =>
      selectedColumns.some(
        (sCol: { field: string }) => sCol.field === col.field,
      ),
    );

    setVisibleColumns(orderedSelectedColumns);
  };
  function createDatabaseSubscription() {
    const nodes = db.arbeitsplatzmessungen
      .find({
        selector: {
          // archiviert: true
        },
      })
      .$.subscribe((docs) => {
        console.log('Subscription is triggered');
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
      });
    return nodes;
  }

  useEffect(() => {
    if (db) {
      const subscription = createDatabaseSubscription();
      return () => subscription.unsubscribe();
    }
  }, [db]);

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
    return formatDateForInput(rowData[additional.field]);
  };


  const cm = React.useRef<ContextMenu>(null);


  const menuModel = [
    {
      label: 'Details anzeigen',
      icon: 'pi pi-fw pi-search',
      command: () => {
        setEdit(mouseRow)
        setDialogEdit(true);
      },
    },
    {
      label: 'Archivieren',
      icon: 'pi pi-fw pi-times',
      command: () => {
        console.log(messungenExport);
        // archiviereSingle()
        confirmDialog({
          message: `Soll die Messungen zum Arbeitsplatz wirklich archiviert werden? Dies kann nicht rückgängig gemacht werden.`,
            header: 'Bestätigung erforderlich',
          accept: () => archivereSelected(mouseRow.id)
        })

      },
    },
  ];

  function insertMany(numberElements: number) {
    console.log('Start insertMany');
    setShowLoadingDialog(true);
    Promise.all(
      Array.from({ length: numberElements }).map(() =>
        db.arbeitsplatzmessungen.insert(generateArbeitsplatz()),
      ),
    ).then((results) => {
      console.log('Inserted', results);
      setShowLoadingDialog(false);
    });
  }

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          label="Neu"
          icon="pi pi-plus"
          severity="success"
          onClick={() => {
            setEdit(null)
            setDialogEdit(true)}
          }
        />
        <Button
          label="Archivieren"
          icon="pi pi-trash"
          severity="danger"
          onClick={() => archivereSelected(messungenExport.map((i) => i.id))}
          disabled={!messungenExport || !messungenExport.length}
        />
        <br/>
        <Button type="button" icon="pi pi-filter-slash" label="Filter löschen" outlined onClick={clearFilter} />
        <br/>
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


        {process.env.NODE_ENV === "development" && (<>
        <br/>
        <Button label="Insert many (1000)" onClick={() => insertMany(100)} />
        <Button label="Insert many (5000)" onClick={() => insertMany(5000)} />
        </>)}
      </div>
    );
  };

  async function saveSettings(orderedSelectedColumns: any) {
    const localDoc = await db.upsertLocal(
      'orderedSelectedColumns', // id
      orderedSelectedColumns,
    );
    console.log(localDoc);
  }

  async function loadSettings() {
    try {
    const localDoc = (
      await db.getLocal(
        'orderedSelectedColumns', // id
      )
    ).toJSON();
    // const orderedSelectedColumns = columns.filter((col) =>
    // localDoc.some(
    //       (sCol: { field: string }) => sCol.field === col.field
    //     )
    //   );
    console.log(localDoc);
    const orderedSelectedColumns = columns.filter((col) =>
      localDoc.data.some((sCol: { field: string }) => sCol.field === col.field),
    );

    setVisibleColumns(orderedSelectedColumns);
  } catch(ex) {
    console.error(ex)
    toast.current?.show(FEHLER_SETTINGS)
  }
  }

  async function archivereSelected(ids: string[]) {
    console.log('archivereSelected', ids);
    if (ids?.length) {
      db.arbeitsplatzmessungen
        .find({
          selector: { id: { $in: ids } },
        })
        .update({
          $set: {
            archiviert: 1,
          },
        })
        .then((doc) => console.log(doc));
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

  const clearFilter = () => {
    setFilters(initFilters());
  };
  function  initFilters() {
    return arrayToObject(columns, 'field', (arg) => {
    if (arg.type == 'date') {
      return {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      };
    }
    if (arg.type == 'numeric') {
      return {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      };
    }
    if (arg.type == 'boolean') {
      return {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      };
    }
    return {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    };
    })
  }
  const [filters, setFilters] = useState(
    initFilters()
  );

  const dateFilterTemplate = (options) => {
    return (
      <Calendar
        value={options.value}
        onChange={(e) => options.filterCallback(e.value, options.index)}
      />
    );
  };

  const verifiedBodyTemplate = (rowData) => {
    return <Checkbox checked={rowData.archiviert} />;
  };

  const verifiedFilterTemplate = (options) => {
    return (
      <TriStateCheckbox
        value={options.value}
        onChange={(e) => options.filterCallback(e.value)}
      />
    );
  };

  const [mouseRow, setMouseRow] = useState(null)

  return (
    <div>
      <ContextMenu model={menuModel} ref={cm} />

      <Toolbar
        className="mb-4"
        start={leftToolbarTemplate}
        end={rightToolbarTemplate}
      />
      <DataTable
        value={products}
        header={header}
        selectionMode="multiple"
        selection={messungenExport}
        filters={filters}
        onSelectionChange={(e) => setMessungenExport(e.value)}
        onContextMenu={(e) => {
          // Entscheidung ob Array oder nicht
          cm.current.show(e.originalEvent);

        }}
        onRowMouseEnter={e => setMouseRow(e.data)}
        resizableColumns
        reorderableColumns
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50, 500]}
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} bis {last} von {totalRecords}"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
        {visibleColumns.map((col) => {
          if (col.type === 'date') {
            return (
              <Column
                key={col.field}
                field={col.field}
                header={col.header}
                filterElement={dateFilterTemplate}
                filter
                sortable
                dataType={col.type}
                body={dateBodyTemplate}
              />
            );
          }
          if (col.type == 'boolean') {
            return (
              <Column
                key={col.field}
                field={col.field}
                header={col.header}
                dataType="boolean"
                sortable
                body={verifiedBodyTemplate}
                filter
                filterElement={verifiedFilterTemplate}
              />
            );
          }
          return (
            <Column
              key={col.field}
              field={col.field}
              header={col.header}
              dataType={col.type}
              filter
              sortable
            />
          );
        })}
      </DataTable>
    </div>
  );
}
