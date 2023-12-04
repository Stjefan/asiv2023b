import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Field } from 'formik';
export function FormNumberField({
  label,
  error,
  bemerkung,
  setFieldValue,
  name,
  ...props
}: any) {
  return (
    <div className="row">
      <label className="col-2">{label}</label>
      <InputNumber
        value={props.value}
        onChange={(event) => setFieldValue(name, event.value)}
        name={name}
        className="col-2"
      />
      {/* <input {...props} type="number" className="col-2" /> */}
      <div className="col-2">
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
      <div className="col-6">{bemerkung ?? ''}</div>
    </div>
  );
}

export function FormTextField({
  label,
  error,
  bemerkung,
  setFieldValue,
  name,
  ...props
}: any) {
  return (
    <div className="row">
      <label className="col-2">{label}</label>
      <InputText
        value={props.value}
        onInput={(event) => setFieldValue(name, event.target.value)}
        name={name}
        className="col-2"
      />
      {/* <input {...props} type="number" className="col-2" /> */}
      <div className="col-2">
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
      <div className="col-6">{bemerkung ?? ''}</div>
    </div>
  );
}

export function FileField({
  label,
  error,
  bemerkung,
  name,
  ...props
}: any) {
  return (
    <div className="row">
      <label className="col-2">{label}</label>
      <Field type="file" name={name} className="col-2" />
      {/* <input {...props} type="number" className="col-2" /> */}
      <div className="col-2">
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
      <div className="col-6">{bemerkung}</div>
    </div>
  );
}
