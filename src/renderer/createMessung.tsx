import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { FormikHelpers, useFormik } from 'formik';
import * as Yup from 'yup';
import {
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Toast } from 'primereact/toast';

import { v4 as uuid } from 'uuid';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { confirmDialog } from 'primereact/confirmdialog';
import { ASIVContext } from './App';
import { generateArbeitsplatz, RxASIVDocumentType } from './database';

import { mixed } from './localDE';

Yup.setLocale({
  mixed,
});
interface KufiInputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  options?: string[];
  groupLabel?: string;
  bemerkung?: string;
}

function Textfield({
  label,
  error,
  bemerkung,
  groupLabel,
  ...props
}: KufiInputProps) {
  return (
    <div className="grid p-2">
      <div className="col-2">{label}</div>
      <div
        className="col-2"
        dangerouslySetInnerHTML={{ __html: groupLabel }}
      ></div>
      <InputText className="col-3" {...props} />
      <div className="col-2">
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
      <div className="col-3">{bemerkung}</div>
    </div>
  );
}

function NumberfieldV2({
  label,
  groupLabel,
  error,
  bemerkung,
  setFieldValue,
  name,
  ...props
}: any) {
  return (
    <div className="grid p-2">
      <div className="col-2">{label}</div>
      <div
        className="col-2"
        dangerouslySetInnerHTML={{ __html: groupLabel }}
      ></div>
      {/* <label
    className="col-2"
    dangerouslySetInnerHTML={{ __html: groupLabel }}
  /> */}
      <InputNumber
        value={props.value}
        onChange={(event) => setFieldValue(name, event.value)}
        name={name}
        className="col-3"
      />
      {/* <input {...props} type="number" className="col-2" /> */}
      <div className="col-2">
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
      <div className="col-3">{bemerkung}</div>
    </div>
  );
}
function DropDownField({
  label,
  options,
  bemerkung,
  groupLabel,
  error,
  ...props
}: KufiInputProps) {
  return (
    <div className="grid p-2">
      {' '}
      <div className="col-2">{label}</div>
      <div className="col-2">{groupLabel}</div>
      <select {...props} className="col-3">
        {options.map((i) => (
          <option key={i}>{i}</option>
        ))}
      </select>
      <div className="col-2">
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
      <div className="col-3">{bemerkung}</div>
    </div>
  );
}

function Datefield({
  label,
  error,
  bemerkung,
  groupLabel,
  ...props
}: KufiInputProps) {
  return (
    <div className="grid p-2">
      {' '}
      <div className="col-2">{label}</div>
      <div className="col-2">{groupLabel}</div>
      <input {...props} type="date" className="col-3" />
      <div className="col-2">
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
      <div className="col-3">{bemerkung}</div>
    </div>
  );
}
export const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = (1 + date.getMonth()).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function createField(i: any, formik: any, label1: string | null = null) {
  if (i.type === 'text') {
    return (
      <Textfield
        key={i.label}
        value={(formik.values as any)[i.name]}
        label={label1 || i.label}
        name={i.name}
        bemerkung={i.bemerkung}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={(formik.errors as any)[i.name]}
        groupLabel={label1 ? i.label : ' '}
      />
    );
  }
  if (i.type === 'numeric') {
    return (
      <NumberfieldV2
        key={i.label}
        value={(formik.values as any)[i.name]}
        label={label1 || i.label}
        name={i.name}
        setFieldValue={formik.setFieldValue}
        bemerkung={i.bemerkung}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={(formik.errors as any)[i.name]}
        groupLabel={label1 ? i.label : ' '}
      />
    );
  }
  if (i.type === 'choice') {
    return (
      <DropDownField
        key={i.label}
        value={(formik.values as any)[i.name]}
        label={label1 || i.label}
        name={i.name}
        bemerkung={i.bemerkung}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={(formik.errors as any)[i.name]}
        groupLabel={label1 ? i.label : ' '}
        options={i.options}
      />
    );
  }
  if (i.type === 'date') {
    return (
      <Datefield
        key={i.label}
        value={(formik.values as any)[i.name]}
        label={label1 || i.label}
        name={i.name}
        bemerkung={i.bemerkung}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={(formik.errors as any)[i.name]}
        groupLabel={label1 ? i.label : ' '}
      />
    );
  }
  throw new Error('Unknown type');
}

export const FlexboxForm = forwardRef((props, ref) => {
  const context = useContext(ASIVContext);

  useImperativeHandle(ref, () => ({
    submitInForm: () => {
      formik.handleSubmit();
    },
  }));

  const { edit, db, toast } = context;
  const fields = [
    {
      type: 'group',
      label: 'Protokoll',
      fields: [
        { type: 'text', name: 'protokollnummer', label: 'Protokollnummer' },
        { type: 'numeric', name: 'protokolljahr', label: 'Jahr' },
      ],
    },

    {
      type: 'text',
      name: 'auftragsnummer',
      label: 'Auftragsnummer',
      validators: ['r'],
    },

    { type: 'text', label: 'Werk', name: 'werknummer', validators: ['r'] },
    {
      type: 'text',
      label: 'Werksteil',
      name: 'werkteil',
      validators: ['r'],
      bemerkung: 'Werkskennziffer',
    },
    { type: 'text', label: 'Gebäude', name: 'gebaeude', validators: ['r'] },
    { type: 'text', label: 'Etage', name: 'etage', validators: [] },
    { type: 'text', label: 'Abteilung', name: 'abteilung', validators: ['r'] },
    {
      type: 'text',
      label: 'Kostenstelle',
      name: 'kostenstelle',
      validators: ['r'],
    },
    {
      type: 'text',
      label: 'AP-Nr',
      name: 'arbeitsplatznummer',
      validators: ['r'],
    },
    {
      type: 'group',
      label: 'Anzahl Arbeitskräfte',
      fields: [
        {
          type: 'text',
          name: 'schichtmodell',
          label: 'Schichtmodell',
          validators: ['r'],
        },
        {
          type: 'numeric',
          name: 'arbeitskraefteproschicht',
          label: 'Anzahl AK',
          bemerkung: 'Anzahl Arbeitskräfte pro Schicht',
          validators: ['r'],
        },
      ],
    },
    {
      type: 'group',
      label: 'Tätigkeit',
      fields: [
        {
          type: 'text',
          name: 'taetigkeit1',
          bemerkung: 'Beschreibung (Schlagworte)',
          validators: ['r'],
        },
        { type: 'text', name: 'taetigkeit2', bemerkung: 'Details' },
        { type: 'text', name: 'taetigkeit3', bemerkung: 'Details' },
      ],
    },
    {
      type: 'date',
      name: 'messdatum',
      label: 'Messdatum',
      validators: ['r'],
      bemerkung: 'bei mehreren Messungen: Datum der letzen Messung',
    },

    {
      type: 'text',
      label: 'Messgerät',
      name: 'messgeraet',
      validators: ['r'],
      bemerkung: 'bei Verwendung mehrerer Messgeräte: "diverse"',
    },
    {
      type: 'group',
      label: 'Messort',
      fields: [
        {
          label: 'Zeile 1',
          type: 'text',
          name: 'messort1',
          bemerkung: 'z.B. Anlagenbeschreibung (EQ-Nr., OP, …)',
          validators: ['r'],
        },
        { label: 'Zeile 2', type: 'text', name: 'messort2' },
        { label: 'Zeile 3', type: 'text', name: 'messort3' },
      ],
    },
    {
      type: 'group',
      label: 'Lärmexposition',
      fields: [
        {
          type: 'numeric',
          label: 'L<sub>ex</sub>',
          name: 'lex',
          bemerkung: 'Lärmexpositionspegel',
          validators: ['r'],
        },
        {
          type: 'numeric',
          label: 'Beurteilungszeit',
          name: 'beurteilungszeit',
          validators: ['r'],
          default: 8,
        },
        {
          type: 'numeric',
          label: 'L<sub>pC,peak</sub>',
          name: 'lcpeak',
          bemerkung: 'Spitzenschalldruckpegel',
          validators: ['r'],
        },
      ],
    },

    {
      type: 'group',
      label: 'Kommentar',
      fields: [
        { type: 'text', name: 'kommentar1' },
        { type: 'text', name: 'kommentar2' },
        { type: 'text', name: 'kommentar3' },
      ],
    },
    {
      type: 'text',
      label: 'Details',
      fild: 'details',
      bemerkung: 'Dok.-ID aus Sharepoint #nnnnnn',
    },

    {
      type: 'choice',
      label: 'Genauigkeitsklasse',
      name: 'genauigkeitsklasse',
      options: ['D', '1', '2', '3'],
      validators: ['r'],
    },
  ];
  const helperSchemaRequired = (arg: any) => {
    if (arg.type === 'text') {
      return Yup.string().required();
    }
    if (arg.type === 'numeric') {
      return Yup.number().required();
    }
  };

  function arrayToObject(arr: any[]) {
    return arr.reduce((prev, currentVal) => {
      if (currentVal.validators?.includes('r')) {
        return { ...prev, [currentVal.name]: helperSchemaRequired(currentVal) };
      }
      return prev;
    }, {} as any);
  }
  const validatorObject = fields.reduce((prev, currentVal) => {
    if (currentVal.type !== 'group') {
      if (currentVal.validators?.includes('r')) {
        return { ...prev, [currentVal.name]: helperSchemaRequired(currentVal) };
      }
      return prev;
    }
    const validatorsInFields = (currentVal.fields as any[]).filter(
      (i) => i.validators,
    );
    return { ...prev, ...arrayToObject(validatorsInFields) };
  }, {} as any);

  const formik = useFormik({
    initialValues: edit
      ? {
          ...edit,
          messdatum: formatDateForInput(new Date(edit.messdatum)),
        }
      : {
          messdatum: formatDateForInput(new Date()),
        },

    validationSchema: Yup.object(validatorObject),
    // validationSchema: Yup.object({
    //     werk: Yup.string().required("Required"),
    //   firstName: Yup.string()
    //     .max(5, "Must be 5 characters or less")
    //     .required("Required"),
    //   lastName: Yup.string().required("Ich brauch das"),
    //   age: Yup.number().required().min(50),
    // }),

    onSubmit: (
      values: RxASIVDocumentType,
      // { setSubmitting }: FormikHelpers<Values>
    ) => {
      const existingQuery = {
        selector: {
          arbeitsplatznummer: values.arbeitsplatznummer,
          archiviert: 0,
        },
      };

      const insertObject = {
        ...values,
        archiviert: 0,
        id: uuid(),
      };

      db.arbeitsplatzmessungen
        .find(existingQuery)
        .exec()
        .then((docs) => {
          if (docs.length) {
            console.log(docs);
            console.log('Bereits vorhanden');
            confirmDialog({
              message:
                'Es exisiert bereits eine Arbeitsplatzmessung zu dieser Arbeitsplatznummer. Beim Fortfahren wird diese archiviert. Trotzdem fortfahren?',
              header: 'Existierende Messung gefunden',
              icon: 'pi pi-exclamation-triangle',
              accept: async () => {
                await db.arbeitsplatzmessungen
                  .find(existingQuery)
                  .update({ $set: { archiviert: 1 } });
                await db.arbeitsplatzmessungen.insert(insertObject);
                toast.current.show({
                  severity: 'success',
                  summary: 'Erfolg',
                  detail:
                    'Bisherige Messung archiviert und neue Messung angelegt',
                  life: 3000,
                });
              },
              reject: () =>
                toast.current.show({
                  severity: 'error',
                  summary: 'Abbruch',
                  detail: 'Es wurde keine Messung angelegt',
                  life: 3000,
                }),
            });
          } else {
            console.log(db.arbeitsplatzmessungen.insert(insertObject));
            toast.current.show({
              severity: 'success',
              summary: 'Erfolg',
              detail: 'Messung angelegt',
              life: 3000,
            });
          }
        }).catch(ex => console.log(error))

      //   alert(JSON.stringify(values, null, 2));
      //   setSubmitting(false);
    },
  });

  function resetData() {
    const a = generateArbeitsplatz();
    if (edit) {
      formik.setValues({
        ...edit,
        messdatum: formatDateForInput(new Date(edit.messdatum)),
      });
    } else {
      formik.setValues({
        ...a,
        messdatum: formatDateForInput(new Date(a.messdatum)),
      });
    }
  }

  const formRef = useRef();

  return (
    <div>

      {process.env.NODE_ENV === 'development' && (
        <Button onClick={resetData} label="Eingabe zurücksetzen" />
      )}
      <div>
        {fields.map((i) => {
          if (i.type === 'group') {
            return i.fields.map((ii, index) => {
              if (index == 0) {
                return createField(ii, formik, i.label);
              }
              return createField(ii, formik, ' ');
            });
          }
          return createField(i, formik);
        })}
      </div>
      <form onSubmit={formik.handleSubmit} ref={formRef}>
      </form>
    </div>
  );
});
