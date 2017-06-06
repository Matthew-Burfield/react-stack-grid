import assert from 'power-assert';
import createArray from '../../src/utils/createArray';


describe('utils#createArray', () => {
  it('Should be create array', () => {
    assert.deepStrictEqual(createArray(0, 3), [
      0,
      0,
      0,
    ]);

    assert.deepStrictEqual(createArray('str', 5), [
      'str',
      'str',
      'str',
      'str',
      'str',
    ]);

    assert.deepStrictEqual(createArray(10, 0), []);
    assert.deepStrictEqual(createArray(10, 1), [10]);
  });
});
