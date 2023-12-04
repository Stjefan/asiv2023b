import { Row, Workbook, Worksheet } from 'exceljs';
import { v4 } from 'uuid';

export async function blob2uint8(file: Blob) {
  return new Promise<Uint8Array>((resolve) => {
    const reader = new FileReader();
    reader.onload = async (event: any) => {
      const arrayBuffer = event.target.result;

      // Convert the ArrayBuffer into a Uint8Array
      const uint8Array = new Uint8Array(arrayBuffer);
      console.log('Start saving');
      resolve(uint8Array);
    };
    reader.readAsArrayBuffer(file);
  });
}

function groupByMultipleProperties(data: any[], keys: string[]) {
  return data.reduce((acc, item) => {
    const group = keys.map((key) => item[key]).join('|');

    if (!acc[group]) {
      acc[group] = [];
    }

    acc[group].push(item);
    return acc;
  }, {});
}

export function groupDataForExcel(data: any[], groups: string[]) {
  // const groupsKostenstelle = groupByMultipleProperties(data, [
  //   'werknummer',
  //   'gebaeude',
  //   'etage',
  //   'abteilung',
  //   'kostenstelle',
  // ]);

  const groupsKostenstelle = groupByMultipleProperties(data, groups);
  const groupedData = Object.values(groupsKostenstelle);

  console.log(groupsKostenstelle, groupedData);

  return groupedData;
}

function copyHeaderRows(worksheet: Worksheet, targetRow: number) {
  const headerRows = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const startRow = 0;
  console.log('Copying HeaderRows', targetRow);
  for (const i of headerRows) {
    const sourceRow = worksheet.getRow(startRow + i);

    const newRow = worksheet.getRow(targetRow + i);

    newRow.values = sourceRow.values;

    newRow.height = sourceRow.height;
    newRow.font = sourceRow.font;
    newRow.alignment = sourceRow.alignment;
    newRow.border = sourceRow.border;
    const merges = (worksheet as any)._merges;
    for (let ii = 1; ii <= sourceRow.cellCount; ii++) {
      newRow.getCell(ii).style = sourceRow.getCell(ii).style;
      if (ii == 37) {
        newRow.getCell(ii).value = {
          formula: `W${targetRow + i}`,
          sharedFormula: '',
          date1904: false,
        };
      }
      if (ii == 38) {
        newRow.getCell(ii).value = {
          formula: `Y${targetRow + i}`,
          sharedFormula: '',
          date1904: false,
        };
      }
    }
    newRow.fill = sourceRow.fill;
  }
  const mergesByHand = [
    { left: 12, right: 21, top: 1, bottom: 3 },
    { left: 22, right: 25, top: 1, bottom: 3 },
    { left: 1, right: 2, top: 4, bottom: 4 },
    { left: 1, right: 2, top: 5, bottom: 5 },

    { left: 3, right: 6, top: 4, bottom: 4 },
    { left: 3, right: 6, top: 5, bottom: 5 },

    { left: 7, right: 8, top: 4, bottom: 4 },
    { left: 7, right: 8, top: 5, bottom: 5 },
    { left: 9, right: 14, top: 4, bottom: 4 },
    { left: 9, right: 14, top: 5, bottom: 5 },
    { left: 15, right: 18, top: 4, bottom: 4 },
    { left: 15, right: 18, top: 5, bottom: 5 },
    { left: 19, right: 22, top: 4, bottom: 4 },
    { left: 19, right: 22, top: 5, bottom: 5 },
    { left: 23, right: 24, top: 4, bottom: 4 },
    { left: 23, right: 24, top: 5, bottom: 5 },
    { left: 25, right: 28, top: 4, bottom: 4 },
    { left: 25, right: 28, top: 5, bottom: 5 },

    { left: 29, right: 30, top: 5, bottom: 5 },
    { left: 31, right: 35, top: 4, bottom: 5 },

    { left: 1, right: 1, top: 7, bottom: 9 },
    { left: 2, right: 3, top: 7, bottom: 9 },
    { left: 4, right: 13, top: 7, bottom: 9 },
    { left: 14, right: 16, top: 7, bottom: 9 },
    { left: 17, right: 20, top: 7, bottom: 9 },
    { left: 21, right: 22, top: 7, bottom: 9 },
    { left: 23, right: 27, top: 7, bottom: 7 },
    { left: 23, right: 24, top: 8, bottom: 8 },
    { left: 25, right: 26, top: 8, bottom: 8 },
    { left: 23, right: 24, top: 9, bottom: 9 },
    { left: 25, right: 26, top: 9, bottom: 9 },
    { left: 27, right: 27, top: 8, bottom: 9 },
    { left: 28, right: 33, top: 7, bottom: 9 },
    { left: 34, right: 35, top: 7, bottom: 9 },
  ];
  for (const m of mergesByHand) {
    worksheet.mergeCells(
      targetRow + m.top,
      m.left,
      targetRow + m.bottom,
      m.right,
    );
  }
  // multiline Merges
  // newRow.numberFormat = sourceRow.numberFormat;
  // Add additional properties as needed
}

interface ExcelGroup {
  startRow: number;
  dataRows: number[];
}
export async function exportExcelGrouped(
  myBlob: Uint8Array,
  groups: any[],
  mapper: any,
  numberRowsPerElement = 3,
) {
  const workbook = new Workbook();
  await workbook.xlsx.load(myBlob);

  const worksheet = workbook.getWorksheet(1);

  const startLine = 10;

  if (true) {
    let startRow = 10;
    const templateRow = 10;
    groups.forEach((data, index) => {
      let groupStartHeader = 0;
      console.log('Data group', index, data);
      let arrayOfRowNumbers;
      if (index > 0) {
        groupStartHeader = startRow;
        copyHeaderRows(worksheet, startRow);
        arrayOfRowNumbers = Array.from(
          { length: data.length },
          (_, index) => numberRowsPerElement * index + groupStartHeader + 9 + 1,
        );
      } else {
        groupStartHeader = 0;
        arrayOfRowNumbers = Array.from(
          { length: data.length },
          (_, index) => numberRowsPerElement * index + startRow,
        );
      }

      // const targetRow = 13

      const merges = (worksheet as any)._merges;
      console.log(merges);

      console.log('ArrayOfNumbers', arrayOfRowNumbers);
      console.log('Copy style from template row');
      for (const targetRow of arrayOfRowNumbers) {
        if (targetRow == 10) continue; // Skip Line 10, as its already formatted
        // console.log(targetRow);
        for (const i of Array.from(
          { length: numberRowsPerElement },
          (_, index) => index,
        )) {
          const sourceRow = worksheet.getRow(templateRow + i);

          const newRow = worksheet.getRow(targetRow + i);

          newRow.values = sourceRow.values;

          newRow.height = sourceRow.height;
          newRow.font = sourceRow.font;
          newRow.alignment = sourceRow.alignment;
          newRow.border = sourceRow.border;
          for (let ii = 1; ii <= sourceRow.cellCount; ii++) {
            newRow.getCell(ii).style = sourceRow.getCell(ii).style;
            if (ii == 37) {
              newRow.getCell(ii).value = {
                formula: `W${targetRow + i}`,
                sharedFormula: '',
                date1904: false,
              };
            }
            if (ii == 38) {
              newRow.getCell(ii).value = {
                formula: `Y${targetRow + i}`,
                sharedFormula: '',
                date1904: false,
              };
            }
          }
          newRow.fill = sourceRow.fill;
          if (true) {
            for (const m in merges) {
              const merge = merges[m];
              if (
                merge.top <= templateRow + i &&
                templateRow + i <= merge.bottom
              ) {
                // Step 3: Apply the merge to the newRow
                const newRowStart =
                  targetRow + i + (merge.top - (templateRow + i));
                const newRowEnd = newRowStart + (merge.bottom - merge.top);
                worksheet.mergeCells(
                  newRowStart,
                  merge.left,
                  newRowEnd,
                  merge.right,
                );
              }
            }
          }

          // newRow.numberFormat = sourceRow.numberFormat;
          // Add additional properties as needed
        }
      }

      console.log('Insert all data');
      if (true) {
        for (const key in mapper) {
          const m = mapper[key];
          if (m.type == 'header') {
            worksheet.getCell(
              m.rowindex + groupStartHeader,
              m.columnIndex,
            ).value = data[0][key];
          }
        }

        for (let i = 0; i < data.length; i++) {
          for (const key in mapper) {
            const m = mapper[key];
            if (m.type == 'row') {
              if (key == 'messdatum') {
                worksheet.getCell(arrayOfRowNumbers[i], m.columnIndex).value =
                  new Date(data[i][key]).toLocaleDateString();
                continue;
              }
              worksheet.getCell(arrayOfRowNumbers[i], m.columnIndex).value =
                data[i][key];
            }

            if (m.type == 'multirow') {
              // console.log(m);
              worksheet.getCell(
                arrayOfRowNumbers[i] + m.subrow,
                m.columnIndex,
              ).value = data[i][key];
            }
          }
        }
      }

      // worksheet.removeConditionalFormatting({})

      for (const i of arrayOfRowNumbers) {
        addConditionalFormatting2Row(worksheet, i, numberRowsPerElement);
      }
      const lastRowCurrentGroup =
        arrayOfRowNumbers[arrayOfRowNumbers.length - 1] + 5;

      console.log('lastRowCurrentGroup', lastRowCurrentGroup);

      worksheet.getRow(lastRowCurrentGroup).addPageBreak();

      startRow = lastRowCurrentGroup + 1;
    });
    worksheet.pageSetup.printArea = `A1:AI${startRow + 100}`;
  }
  // worksheet.addConditionalFormatting({
  //   ref: 'A10:AI43',
  //   rules: [
  //     { priority: 10,
  //       type: 'expression',
  //       formulae: ['MOD(ROW(),2)=0'],
  //       style: {fill: {type: 'pattern', pattern: 'solid', bgColor: {argb: 'FFFF0000'}}},
  //     }
  //   ]
  // })

  const buf = await workbook.xlsx.writeBuffer();
  const resultAsBlob = new Blob([buf]);

  return resultAsBlob;
}

function addConditionalFormatting2Row(
  worksheet: Worksheet,
  i: number,
  numberRowsPerElement = 3,
) {
  worksheet.addConditionalFormatting({
    ref: `A${i}:AI${i + numberRowsPerElement - 1}`,
    rules: [
      {
        priority: 9,
        type: 'expression',
        formulae: [`$AK$${i}>=85`],
        style: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            bgColor: { argb: 'FFFF7C80' },
          },
        },
      },
    ],
  });
  worksheet.addConditionalFormatting({
    ref: `A${i}:AI${i + numberRowsPerElement - 1}`,
    rules: [
      {
        priority: 9,
        type: 'expression',
        formulae: [`$AL$${i}>=137`],
        style: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            bgColor: { argb: 'FFFF7C80' },
          },
        },
      },
    ],
  });
  worksheet.addConditionalFormatting({
    ref: `A${i}:AI${i + numberRowsPerElement - 1}`,
    rules: [
      {
        priority: 8,
        type: 'expression',
        formulae: [`$AK$${i}>=80`],
        style: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            bgColor: { argb: 'FFFFFF99' },
          },
        },
      },
    ],
  });
  worksheet.addConditionalFormatting({
    ref: `A${i}:AI${i + numberRowsPerElement - 1}`,
    rules: [
      {
        priority: 8,
        type: 'expression',
        formulae: [`$AL$${i}>=135`],
        style: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            bgColor: { argb: 'FFFFFF99' },
          },
        },
      },
    ],
  });
}

export async function exportExcel(
  myBlob: Uint8Array,
  data: any[],
  mapper: any,
) {
  const workbook = new Workbook();
  await workbook.xlsx.load(myBlob);

  const worksheet = workbook.getWorksheet(1);

  const startLine = 10;
  console.log(data);

  const startRow = 10;
  // const targetRow = 13

  const merges = (worksheet as any)._merges;
  console.log(merges);

  const arrayOfRowNumbers = Array.from(
    { length: data.length },
    (_, index) => 3 * index + 13,
  );

  worksheet.pageSetup.printArea = `A1:AI${
    arrayOfRowNumbers[arrayOfRowNumbers.length - 1] + 2
  }`;
  if (true) {
    for (const targetRow of arrayOfRowNumbers) {
      console.log(targetRow);
      for (const i of [0, 1, 2]) {
        const sourceRow = worksheet.getRow(startRow + i);

        const newRow = worksheet.getRow(targetRow + i);

        newRow.values = sourceRow.values;

        newRow.height = sourceRow.height;
        newRow.font = sourceRow.font;
        newRow.alignment = sourceRow.alignment;
        newRow.border = sourceRow.border;
        for (let ii = 1; ii <= sourceRow.cellCount; ii++) {
          newRow.getCell(ii).style = sourceRow.getCell(ii).style;
          if (ii == 37) {
            newRow.getCell(ii).value = {
              formula: `W${targetRow + i}`,
              sharedFormula: '',
              date1904: false,
            };
          }
          if (ii == 38) {
            newRow.getCell(ii).value = {
              formula: `Y${targetRow + i}`,
              sharedFormula: '',
              date1904: false,
            };
          }
        }
        newRow.fill = sourceRow.fill;

        for (const m in merges) {
          const merge = merges[m];
          if (merge.top <= startRow + i && startRow + i <= merge.bottom) {
            // Step 3: Apply the merge to the newRow
            const newRowStart = targetRow + i + (merge.top - (startRow + i));
            const newRowEnd = newRowStart + (merge.bottom - merge.top);
            worksheet.mergeCells(
              newRowStart,
              merge.left,
              newRowEnd,
              merge.right,
            );
          }
        }

        // newRow.numberFormat = sourceRow.numberFormat;
        // Add additional properties as needed
      }
    }
  }
  if (true) {
    for (const key in mapper) {
      const m = mapper[key];
      if (m.type == 'header') {
        worksheet.getCell(m.rowindex, m.columnIndex).value = data[0][key];
      }
    }

    for (let i = 0; i < data.length; i++) {
      for (const key in mapper) {
        const m = mapper[key];
        if (m.type == 'row') {
          if (key == 'messdatum') {
            worksheet.getCell(startLine + i, m.columnIndex).value = new Date(
              data[i][key],
            ).toLocaleDateString();
            continue;
          }
          worksheet.getCell(startLine + 3 * i, m.columnIndex).value =
            data[i][key];
        }

        if (m.type == 'multirow') {
          console.log(m);
          worksheet.getCell(startLine + 3 * i + m.subrow, m.columnIndex).value =
            data[i][key];
        }
      }
    }
  }

  for (const i of [arrayOfRowNumbers[arrayOfRowNumbers.length - 1] + 2]) {
    worksheet.getRow(i).addPageBreak();
  }
  // worksheet.removeConditionalFormatting({})
  for (const i of arrayOfRowNumbers) {
    worksheet.addConditionalFormatting({
      ref: `A${i}:AI${i + 2}`,
      rules: [
        {
          priority: 9,
          type: 'expression',
          formulae: [`$AK$${i}>=85`],
          style: {
            fill: {
              type: 'pattern',
              pattern: 'solid',
              bgColor: { argb: 'FFFF7C80' },
            },
          },
        },
      ],
    });
    worksheet.addConditionalFormatting({
      ref: `A${i}:AI${i + 2}`,
      rules: [
        {
          priority: 9,
          type: 'expression',
          formulae: [`$AL$${i}>=137`],
          style: {
            fill: {
              type: 'pattern',
              pattern: 'solid',
              bgColor: { argb: 'FFFF7C80' },
            },
          },
        },
      ],
    });
    worksheet.addConditionalFormatting({
      ref: `A${i}:AI${i + 2}`,
      rules: [
        {
          priority: 8,
          type: 'expression',
          formulae: [`$AK$${i}>=80`],
          style: {
            fill: {
              type: 'pattern',
              pattern: 'solid',
              bgColor: { argb: 'FFFFFF99' },
            },
          },
        },
      ],
    });
    worksheet.addConditionalFormatting({
      ref: `A${i}:AI${i + 2}`,
      rules: [
        {
          priority: 8,
          type: 'expression',
          formulae: [`$AL$${i}>=135`],
          style: {
            fill: {
              type: 'pattern',
              pattern: 'solid',
              bgColor: { argb: 'FFFFFF99' },
            },
          },
        },
      ],
    });
  }

  // worksheet.addConditionalFormatting({
  //   ref: 'A10:AI43',
  //   rules: [
  //     { priority: 10,
  //       type: 'expression',
  //       formulae: ['MOD(ROW(),2)=0'],
  //       style: {fill: {type: 'pattern', pattern: 'solid', bgColor: {argb: 'FFFF0000'}}},
  //     }
  //   ]
  // })

  const buf = await workbook.xlsx.writeBuffer();
  const resultAsBlob = new Blob([buf]);

  return resultAsBlob;
}

export async function exportExcelAsBackup(
  myBlob: Uint8Array,
  data: any[],
  mapper: any,
) {
  const workbook = new Workbook();
  await workbook.xlsx.load(myBlob);

  const worksheet = workbook.getWorksheet(1);

  const startLine = 8;
  console.log(data);

  if (true) {
    for (let i = 0; i < data.length; i++) {
      for (const key in mapper) {
        const m = mapper[key];
        if (m.type == 'row') {
          if (key == 'archiviert') {
            worksheet.getCell(startLine + i, m.columnIndex).value = data[i][key]
              ? 'aktuell'
              : 'archiviert';
            continue;
          }
          if (key == 'messdatum') {
            worksheet.getCell(startLine + i, m.columnIndex).value = new Date(
              data[i][key],
            );
            continue;
          }
          worksheet.getCell(startLine + i, m.columnIndex).value = data[i][key];
        }
      }
    }
  }

  const buf = await workbook.xlsx.writeBuffer();
  const resultAsBlob = new Blob([buf]);

  return resultAsBlob;
}

export async function importExcel(
  myBlob: Uint8Array,
  mapper: any,
  dataStartsAtLine: number = 8,
  sheetName = 'ASIV Import (Bsp)',
) {
  const workbook = new Workbook();
  await workbook.xlsx.load(myBlob);
  console.log(mapper);
  const worksheet = workbook.getWorksheet(sheetName);
  const result = [] as any;
  worksheet.eachRow((row: Row, rowNumber) => {
    // console.log(row, rowNumber);
    if (rowNumber >= dataStartsAtLine) {
      try {
        const r = {} as any;

        for (const key in mapper) {
          const val = mapper[key];
          if (key == 'archiviert') {
            r[key] = row.getCell(val.columnIndex)?.value != 'aktuell';
            continue;
          }
          if (key == 'default') {
            // TODO: Es wird auf ein Default-Feld geprüft, keine AHnung, wo das her kommt
            continue;
          }

          r[key] = row.getCell(val.columnIndex)?.value;
        }
        r.id = v4();
        r.messdatum = (r.messdatum as Date).getTime();
        result.push(r);
      } catch (err) {
        console.error(err, rowNumber);
      }
    }
  });
  console.log(result);
  return result;
}
