import saveAs from 'file-saver';
import {
  groupDataForExcel,
  exportExcelGrouped,
  exportExcelAsBackup,
} from './useExcel';
import * as ExportVorlage from './excel/ASIV Export 1.xlsx';
import * as MapperExport1 from './excel/ASIV Export 1.json';

import * as ExportVorlageAlternativ from './excel/ASIV Ausgabe SMP (altern.).xlsx';
import * as MapperExportAlternativ from './excel/ASIV Export Alternativ.json';

import * as ExportVorlageKostenstelle from './excel/ASIV Export Kostenstelle.xlsx';
import * as MapperVorlageKostenstelle from './excel/ASIV Export Kostenstelle.json';
import * as ExportVorlageGebaeudeEtage from './excel/ASIV Export Gebaeude Etage.xlsx';
import * as MapperVorlageGebaeudeEtage from './excel/ASIV Export Gebaeude Etage.json';
import * as ExportVorlageAbteilung from './excel/ASIV Export Abteilung.xlsx';
import * as MapperVorlageAbteilung from './excel/ASIV Export Abteilung.json';

import * as BackupVorlage from './excel/ASIV Export Backup.xlsx';
import * as MapperBackupExport from './excel/ASIV Export Backup.json';

export function runExcelExport(products: any[], selectedCategory = '') {
  console.log('selectedCategory', selectedCategory);
  async function fetchData() {
    return new Promise(async (resolve, reject) => {
      // Fetch the xlsx file from the public folder
      // ExportVorlage
      // MapperExport1
      const v1 = {
        vorlage: ExportVorlage,
        mapper: MapperExport1,
        name: 'default',
        groups: [
          'werknummer',
          'werkteil',
          'gebaeude',
          'etage',
          'abteilung',
          'kostenstelle',
        ],
      };
      const vAlternativ = {
        vorlage: ExportVorlageAlternativ,
        mapper: MapperExportAlternativ,
        name: 'default',
        groups: [
          'werknummer',
          'werkteil',
          'gebaeude',
          'etage',
          'abteilung',
          'kostenstelle',
        ],
      };
      const vAbteilung = {
        vorlage: ExportVorlageAbteilung,
        mapper: MapperVorlageAbteilung,
        name: 'Abteilung',
        groups: ['werknummer', 'werkteil', 'abteilung'],
        numberRowsPerElement: 4,
      };
      const vKostenstelle = {
        vorlage: ExportVorlageKostenstelle,
        mapper: MapperVorlageKostenstelle,
        name: 'Kostenstelle',
        groups: ['werknummer', 'werkteil', 'abteilung', 'kostenstelle'],
      };
      const vGebaeudeEtage = {
        vorlage: ExportVorlageGebaeudeEtage,
        mapper: MapperVorlageGebaeudeEtage,
        name: 'GebaeudeEtage',
        groups: ['werknummer', 'werkteil', 'gebaeude', 'etage'],
      };

      const mapping = {
        Kostenstelle: vKostenstelle,
        'Gebäude / Etage': vGebaeudeEtage,
        'Ausgabe SMP (altern.)': vAlternativ,
        Standard: v1,
        Abteilung: vAbteilung,
      };

      const v = mapping[selectedCategory]; // vAbteilung;
      if (!v) reject(new Error('Invalid category'));
      const response = await fetch(v.vorlage.default);
      const blob = await response.blob();

      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target!.result as any);
        console.log(data);
        // const workbook = XLSX.read(data, { type: 'array' });

        // // Assuming the data is on the first sheet, adjust as needed
        // const worksheetName = workbook.SheetNames[0];
        // const worksheet = workbook.Sheets[worksheetName];

        // // Convert the worksheet to JSON
        // const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // setData(jsonData);
        console.log(products);
        const groups = groupDataForExcel(
          // [   ...products.filter((_, idx) => idx <= 2),
          //   ...products.filter((_, idx) => idx <= 3),]
          products,
          v.groups,
        );
        console.log(groups);
        await saveAs(
          await exportExcelGrouped(
            data,
            groups,
            v.mapper,
            v.numberRowsPerElement ?? 3,
          ),
          `export-nach-vorlage-${v.name}.xlsx`,
        );
        resolve(0);
      };
      reader.readAsArrayBuffer(blob);
    });
  }

  return fetchData();
}

export function runExcelBackup(products: any[]) {
  async function fetchData() {
    // Fetch the xlsx file from the public folder
    const response = await fetch(BackupVorlage.default);
    const blob = await response.blob();

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target!.result as any);
      console.log(data);
      // const workbook = XLSX.read(data, { type: 'array' });

      // // Assuming the data is on the first sheet, adjust as needed
      // const worksheetName = workbook.SheetNames[0];
      // const worksheet = workbook.Sheets[worksheetName];

      // // Convert the worksheet to JSON
      // const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // setData(jsonData);
      saveAs(
        await exportExcelAsBackup(data, products, MapperBackupExport),
        'full-db-export.xlsx',
      );
    };
    reader.readAsArrayBuffer(blob);
  }

  fetchData();
}
