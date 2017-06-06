import assert from 'power-assert';
import transition from '../../src/utils/transition';


describe('utils#transition', () => {
  it('Should be build a transition string', () => {
    assert(transition(['opacity'], 1000, 'ease-in') === 'opacity 1000ms ease-in');

    const easing = 'cubic-bezier(0.215, 0.61, 0.355, 1)';
    assert(
      transition(['transform', 'opacity', 'background'], 200, easing) ===
      [
        `transform 200ms ${easing}`,
        `opacity 200ms ${easing}`,
        `background 200ms ${easing}`,
      ].join(',')
    );
  });
});
