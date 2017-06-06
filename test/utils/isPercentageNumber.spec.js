import assert from 'power-assert';
import isPercentageNumber from '../../src/utils/isPercentageNumber';


describe('utils#isPercentageNumber', () => {
  it('Should be return true', () => {
    assert(isPercentageNumber('0%'));
    assert(isPercentageNumber('10%'));
    assert(isPercentageNumber('10.01%'));
    assert(isPercentageNumber('-10.01%'));
  });

  it('Should be return false', () => {
    assert(isPercentageNumber('10.0.0%') === false);

    assert(isPercentageNumber(0) === false);
    assert(isPercentageNumber(10) === false);
    assert(isPercentageNumber(10.000) === false);
    assert(isPercentageNumber(0xff) === false);
    assert(isPercentageNumber(-1) === false);
    assert(isPercentageNumber(-1.01) === false);
    assert(isPercentageNumber(NaN) === false);
    assert(isPercentageNumber(Infinity) === false);
    assert(isPercentageNumber({}) === false);
    assert(isPercentageNumber([]) === false);
    assert(isPercentageNumber(() => {}) === false);
    assert(isPercentageNumber('string') === false);
    assert(isPercentageNumber('100') === false);
  });
});
