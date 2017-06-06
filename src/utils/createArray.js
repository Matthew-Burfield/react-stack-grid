// @flow
// eslint-disable-next-line arrow-parens
const createArray = <T>(v: T, l: number): T[] => {
  const array = [];
  for (let i = 0; i < l; i += 1) array.push(v);
  return array;
};

export default createArray;
