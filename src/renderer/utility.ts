import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator';

const conf1 = { dictionaries: [adjectives, colors, animals] };

export function getRandomName() {
  return uniqueNamesGenerator(conf1);
}

export function groupBy(array: any[], key: string) {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(
      currentValue,
    );
    return result;
  }, {});
}

export function groupByMultipleKeys(data: any[], keys: string[]) {
  return data.reduce((acc, item) => {
    keys
      .reduce((nestedAcc, key, index) => {
        if (!nestedAcc[item[key]]) {
          if (index === keys.length - 1) {
            // If it's the last key, initialize an array to collect items
            nestedAcc[item[key]] = [];
          } else {
            // Otherwise, initialize an object for the next level of nesting
            nestedAcc[item[key]] = {};
          }
        }
        return nestedAcc[item[key]];
      }, acc)
      .push(item);
    return acc;
  }, {});
}

export function object2array(arg: any, parent = null, level = 0) {
  return Object.keys(arg).reduce((arr, key) => {
    arr.push({
      label: key,
      children: arg[key].length
        ? arg[key]
        : object2array(arg[key], arg, level + 1),
      parent,
      expanded: false,
      key,
      type: level == 4 ? 'kostenstelle' : 'default',
    });
    return arr;
  }, [] as any[]);
}

export function arrayToObject(arr: any[], key: string, callback: (any) => any = null) {
  const obj = {} as any;
  arr.forEach((item: any) => {
      obj[item[key]] = callback ? callback(item) : item;
  });
  return obj;
}
