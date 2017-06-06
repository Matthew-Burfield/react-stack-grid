// @flow
const isPercentageNumber = (v: any): boolean => typeof v === 'string' && /^\d+(\.\d+)?%$/.test(v);

export default isPercentageNumber;
