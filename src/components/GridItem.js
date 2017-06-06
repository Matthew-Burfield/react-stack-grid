// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';
import shallowequal from 'shallowequal';
import transition from '../utils/transition';
import buildStyles from '../utils/buildStyles';
import { raf } from '../animations/request-animation-frame';

import type { Units, Rect } from '../types/';


type ResizeDetectorProps = {
  ref: Function;
  style: { [key: string]: any };
  onSize: Function;
  [key: string]: any;
};

const ResizeDetector = sizeMe({
  monitorWidth: false,
  monitorHeight: true,
})((props: ResizeDetectorProps) => (
  <span {...props} />
));


type Props = {
  itemKey: string;
  index: number;
  rect: Rect;
  containerSize: {
    width: number;
    height: number;
    actualWidth: number;
  };
  duration: number;
  easing: string;
  appearDelay: number;
  appear: Function;
  appeared: Function;
  enter: Function;
  entered: Function;
  leaved: Function;
  units: Units;
  vendorPrefix: boolean;
  userAgent: ?string;
  onMounted: Function;
  onResize: Function;
  onUnmount: Function;
};

type State = Object;

type DefaultProps = Object;

const getTransitionStyles = (type: string, props: Props): Object => {
  const { rect, containerSize, index } = props;

  return props[type](rect, containerSize, index);
};

const getPositionStyles = (rect: Rect, zIndex: number): Object => ({
  translateX: `${rect.left}px`,
  translateY: `${rect.top}px`,
  zIndex,
});


export default class GridItem extends Component<DefaultProps, Props, State> {
  static defaultProps: DefaultProps;

  props: Props;
  state: State;
  node: ?HTMLElement = null;
  height: number = 0;
  mounted: boolean = false;
  appearTimer: ?number = null;

  static propTypes = {
    itemKey: PropTypes.string,
    index: PropTypes.number,
    rect: PropTypes.shape({
      top: PropTypes.number,
      left: PropTypes.number,
      width: PropTypes.number,
      height: PropTypes.number,
    }),
    containerSize: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number,
      actualWidth: PropTypes.number,
    }),
    duration: PropTypes.number,
    easing: PropTypes.string,
    appearDelay: PropTypes.number,
    appear: PropTypes.func,
    appeared: PropTypes.func,
    enter: PropTypes.func,
    entered: PropTypes.func,
    leaved: PropTypes.func,
    units: PropTypes.shape({
      length: PropTypes.string,
      angle: PropTypes.string,
    }),
    vendorPrefix: PropTypes.bool,
    userAgent: PropTypes.string,
    onMounted: PropTypes.func,
    onResize: PropTypes.func,
    onUnmount: PropTypes.func,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      ...getPositionStyles(props.rect, 1),
      ...getTransitionStyles('appear', props),
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.props.onMounted(this);
  }

  componentWillUnmount() {
    this.mounted = false;
    clearTimeout(this.appearTimer);
    this.appearTimer = null;
    this.props.onUnmount(this);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (!shallowequal(nextProps, this.props)) {
      raf(() => {
        this.setStateIfNeeded({
          ...this.state,
          ...getPositionStyles(nextProps.rect, 2),
        });
      });
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return (
      !shallowequal(nextProps, this.props) ||
      !shallowequal(nextState, this.state)
    );
  }

  componentWillAppear(callback: Function) {
    this.appearTimer = setTimeout(callback, this.props.appearDelay * this.props.index);
  }

  componentDidAppear() {
    this.setAppearedStyles();
  }

  componentWillEnter(callback: Function) {
    this.setEnterStyles();
    this.forceUpdate(callback);
  }

  componentDidEnter() {
    this.setEnteredStyles();
  }

  componentWillLeave(callback: Function) {
    this.setLeaveStyles();
    setTimeout(callback, this.props.duration);
  }

  setStateIfNeeded(state: Object) {
    if (this.mounted) {
      this.setState(state);
    }
  }

  setAppearedStyles() {
    this.setStateIfNeeded({
      ...this.state,
      ...getTransitionStyles('appeared', this.props),
      ...getPositionStyles(this.props.rect, 1),
    });
  }

  setEnterStyles() {
    this.setStateIfNeeded({
      ...this.state,
      ...getPositionStyles(this.props.rect, 2),
      ...getTransitionStyles('enter', this.props),
    });
  }

  setEnteredStyles() {
    this.setStateIfNeeded({
      ...this.state,
      ...getTransitionStyles('entered', this.props),
      ...getPositionStyles(this.props.rect, 1),
    });
  }

  setLeaveStyles() {
    this.setStateIfNeeded({
      ...this.state,
      ...getPositionStyles(this.props.rect, 2),
      ...getTransitionStyles('leaved', this.props),
    });
  }

  handleResize = (to: { width: ?number; height: number; position: ?any }) => {
    if (this.height === 0) {
      this.height = to.height;
    } else if (this.height !== to.height) {
      this.height = to.height;
      this.props.onResize(this);
    }
  };

  render() {
    const {
      /* eslint-disable no-unused-vars */
      index,
      containerSize,
      appearDelay,
      appear,
      appeared,
      enter,
      entered,
      leaved,
      onResize,
      onMounted,
      onUnmount,
      itemKey,
      /* eslint-enable no-unused-vars */
      rect,
      duration,
      easing,
      units,
      vendorPrefix,
      userAgent,
      ...rest
    } = this.props;

    const style = buildStyles({
      ...this.state,
      display: 'block',
      position: 'absolute',
      top: 0,
      left: 0,
      width: rect.width,
      transition: transition(['opacity', 'transform'], duration, easing),
    }, units, vendorPrefix, userAgent);

    /* eslint-disable no-return-assign */
    return (
      <ResizeDetector
        {...rest}
        ref={node => this.node = node}
        style={style}
        onSize={this.handleResize}
      />
    );
    /* eslint-enable no-return-assign */
  }
}
