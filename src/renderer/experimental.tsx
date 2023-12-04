import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import React, { useRef, useCallback } from 'react';
import { Button } from 'primereact/button';
import * as Yup from 'yup'
import { InputNumber } from 'primereact/inputnumber';
import { Formik, Form, Field } from 'formik';
import { ERFOLG_EINLESEN, FEHLER_EINLESEN } from './messages';
import {FormNumberField, FormTextField, FileField} from './shared'


const ImportFileForm = ({ setFormikRef, onSubmit }) => {
  const vaildation = Yup.object({
        sheetname: Yup.string().required(),
        file: Yup.string().required(),
        zeilennummer: Yup.number().required()
  })
  return (
    <Formik
    innerRef={setFormikRef}
      initialValues={{ sheetname: '', file: '', zeilennummer: 8 }}
      validationSchema={vaildation}
      onSubmit={onSubmit}
      // Add your validation schema here if needed
    >
      {({ handleSubmit, errors, setFieldValue, values }) => (
        <Form onSubmit={handleSubmit}>
          <div className="container">
          <FormTextField label="Name des Sheets" name="sheetname" setFieldValue={setFieldValue}/>
          <FileField name="file" label="Datei"/>
          {/* <Field name="file" type="file" /> */}
          <FormNumberField label="Zeilennummer" setFieldValue={setFieldValue} name="zeilennummer"/>
          {/* <InputNumber value={values.zeilennummer} onChange={event => setFieldValue("zeilennummer", event.value)} name="zeilennummer"/> */}
          {/* Add more fields as needed */}
          </div>
          {JSON.stringify(errors)}
          <Button label="Submit"/>
        </Form>
      )}
    </Formik>
  );
};

export function ExperimentalDialog({showDialog, setShowDialog,...props}) {
  const toast = useRef(null);
  // const [showDialog, setShowDialog] = React.useState(false);

  const handleFormSubmit = (values, actions) => {
    console.log(values); // Process form submission here
    toast.current.show({ severity: 'success', summary: 'Success', detail: 'Form submitted' });
    setShowDialog(false); // Close the dialog
    actions.setSubmitting(false);
  };

  const setFormikRef = useCallback((ref) => {
    formikRef.current = ref;
  }, []);

  const formikRef = useRef(null);

  const dialogFooter = (
    <div>
      <Button onClick={() => setShowDialog(false)} label='Abbrechen'/>
      <Button onClick={() =>
        {
          formikRef.current.submitForm().then(() => {
            if (formikRef.current.errors) {
              toast.current.show(FEHLER_EINLESEN);
            } else {
              toast.current.show(ERFOLG_EINLESEN);
            }

          });

        }} label='Ausführen'/>
    </div>
  );




  return (
    <div>
      <Toast ref={toast} />
      <Button onClick={() => setShowDialog(true)} label="Open Dialog"/>
      <Dialog header="Experimental Form" visible={showDialog} footer={dialogFooter} onHide={() => setShowDialog(false)}>
        <ImportFileForm ref={formikRef} onSubmit={handleFormSubmit} setFormikRef={setFormikRef} />
      </Dialog>
    </div>
  );
};
