// @flow
const transition = (props: Array<string>, duration: number, easing: string) => (
  props.map(prop =>
    `${prop} ${duration}ms ${easing}`
  ).join(',')
);

export default transition;
