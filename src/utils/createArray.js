// @flow
// eslint-disable-next-line arrow-parens
const createArray = <T>(value: T, length: number): T[] => {
  const array = [];

  for (let i = 0; i < length; i += 1) {
    array.push(value);
  }

  return array;
};

export default createArray;
