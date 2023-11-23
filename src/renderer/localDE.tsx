/* eslint-disable no-template-curly-in-string */
export const mixed = {
  default: '${path} ist ungültig',
  required: 'Pflichtfeld',
  oneOf: '${path} muss einem der folgenden Werte entsprechen: ${values}',
  notOneOf: '${path} darf keinem der folgenden Werte entsprechen: ${values}',
};

export const string = {
  length: '${path} muss genau ${length} Zeichen lang sein',
  min: '${path} muss mindestens ${min} Zeichen lang sein',
  max: '${path} darf höchstens ${max} Zeichen lang sein',
  matches: '${path} muss wie folgt aussehen: "${regex}"',
  email: '${path} muss eine gültige E-Mail-Adresse enthalten',
  url: '${path} muss eine gültige URL sein',
  trim: '${path} darf keine Leerzeichen am Anfang oder Ende enthalten',
  lowercase: '${path} darf nur Kleinschreibung enthalten',
  uppercase: '${path} darf nur Großschreibung enthalten',
};

export const number = {
  min: '${path} muss größer oder gleich ${min} sein',
  max: '${path} muss kleiner oder gleich ${max} sein',
  lessThan: '${path} muss kleiner sein als ${less}',
  moreThan: '${path} muss größer sein als ${more}',
  notEqual: '${path} darf nicht gleich sein mit "${notEqual}"',
  positive: '${path} muss eine positive Zahl sein',
  negative: '${path} muss eine negative Zahl sein',
  integer: '${path} muss eine ganze Zahl sein',
};

export const date = {
  min: '${path} muss später sein als ${min}',
  max: '${path} muss früher sein als ${max}',
};

export const boolean = {};

export const object = {
  noUnknown:
    '${path}-Feld darf keine Schlüssel verwenden, die nicht im "Objekt-Shape" definiert wurden',
};

export const array = {
  min: '${path}-Feld muss mindesten ${min} Einträge haben',
  max: '${path}-Feld darf höchstens ${max} Einträge haben',
};

export default {
  mixed,
  string,
  number,
  date,
  object,
  array,
  boolean,
};
