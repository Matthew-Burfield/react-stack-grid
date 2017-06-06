import assert from 'power-assert';
import isNumber from '../../src/utils/isNumber';


describe('utils#isNumber', () => {
  it('Should be return true', () => {
    assert(isNumber(0));
    assert(isNumber(10));
    assert(isNumber(10.000));
    assert(isNumber(0xff));
    assert(isNumber(-1));
    assert(isNumber(-1.01));
  });

  it('Should be return false', () => {
    assert(isNumber(NaN) === false);
    assert(isNumber(Infinity) === false);
    assert(isNumber({}) === false);
    assert(isNumber([]) === false);
    assert(isNumber(() => {}) === false);
    assert(isNumber('string') === false);
    assert(isNumber('100') === false);
  });
});
