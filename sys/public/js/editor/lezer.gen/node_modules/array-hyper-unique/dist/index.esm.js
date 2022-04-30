import _equals from 'deep-eql';
import { findLastIndex, findIndex } from 'lodash-es';

function equals(a1, a2) {
  return _equals(a1, a2);
}
function defaultFilter(options = {}) {
  const checker = options.checker || defaultChecker;
  const filter = options.filter || null;
  const find = options.removeFromFirst ? findLastIndex : findIndex;

  const cb = (val, index, arr) => {
    let i = find(arr, a => checker(a, val, arr, arr));
    return i == index && (!filter || filter(val));
  };

  return cb;
}
function defaultChecker(element, value, arr_new, arr_old) {
  return _equals(element, value);
}

function array_unique(arr, options = {}) {
  if (!Array.isArray(arr)) {
    throw new TypeError(`Expected an Array but got ${typeof arr}.`);
  }

  const cb = defaultFilter(options);

  if (options.overwrite) {
    let index = arr.length;

    while (index--) {
      let val = arr[index];

      if (!cb(val, index, arr)) {
        arr.splice(index, 1);
      }
    }

    return arr;
  }

  return arr.filter(cb);
}
function array_unique_overwrite(arr, options = {}) {
  return array_unique(arr, { ...options,
    overwrite: true
  });
}
function lazy_unique(...arr) {
  if (arr.length > 1) {
    return array_unique(arr);
  }

  return array_unique(arr[0]);
}
function lazy_unique_overwrite(...arr) {
  if (arr.length > 1) {
    return array_unique_overwrite(arr);
  }

  return array_unique_overwrite(arr[0]);
}
lazy_unique.array_unique = array_unique;
lazy_unique.array_unique_overwrite = array_unique_overwrite;
lazy_unique.lazy_unique_overwrite = lazy_unique_overwrite;
lazy_unique.equals = equals;
lazy_unique.defaultFilter = defaultFilter;
lazy_unique.defaultChecker = defaultChecker;
lazy_unique.lazy_unique = lazy_unique;
lazy_unique.default = lazy_unique;
Object.defineProperty(lazy_unique, "__esModule", {
  value: true
});

export { array_unique, array_unique_overwrite, lazy_unique as default, defaultChecker, defaultFilter, equals, lazy_unique, lazy_unique_overwrite };
//# sourceMappingURL=index.esm.js.map
