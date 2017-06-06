// @flow
import React, { Component, isValidElement } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import sizeMe from 'react-sizeme';
import shallowequal from 'shallowequal';
import ExecutionEnvironment from 'exenv';
import invariant from 'invariant';
import GridItem from './GridItem';
import isNumber from '../utils/isNumber';
import isPercentageNumber from '../utils/isPercentageNumber';
import createArray from '../utils/createArray';
import transition from '../utils/transition';
import { raf } from '../animations/request-animation-frame';
import * as easings from '../animations/easings';
import * as transitions from '../animations/transitions/';

import type { Units } from '../types/';

const imagesLoaded = ExecutionEnvironment.canUseDOM ? require('imagesloaded') : null;


/* eslint-disable consistent-return */
const getColumnLengthAndWidth = (
  width: number,
  value: number | string,
  gutter: number
): [number, number] => {
  if (isNumber(value)) {
    const columnWidth = parseFloat(value);

    return [
      Math.floor((width - (((width / columnWidth) - 1) * gutter)) / columnWidth),
      columnWidth,
    ];
  } else if (isPercentageNumber(value)) {
    const columnPercentage = parseFloat(value) / 100;
    const maxColumn = Math.floor(1 / columnPercentage);
    const columnWidth = (width - (gutter * (maxColumn - 1))) / maxColumn;

    return [
      maxColumn,
      columnWidth,
    ];
  }

  invariant(false, 'Should be columnWidth is a number or percentage string.');
};
/* eslint-enable consistent-return */


/* eslint-disable react/no-unused-prop-types */
type Props = {
  children: React$Element<any>;
  className?: string;
  style: Object;
  component: string;
  columnWidth: number | string;
  gutterWidth: number;
  gutterHeight: number;
  duration: number;
  easing: string;
  appearDelay: number;
  appear: Function;
  appeared: Function;
  enter: Function;
  entered: Function;
  leaved: Function;
  units: Units;
  monitorImagesLoaded: boolean;
  vendorPrefix: boolean;
  userAgent: ?string;
  enableSSR: boolean;
};

type InlineState = {
  rects: Array<{
    top: number;
    left: number;
    width: number;
    height: number;
  }>;
  actualWidth: number;
  height: number;
  columnWidth: number;
};

type InlineProps = Props & {
  size: {
    width: number;
    height: number;
  }
};

type InlineDefaultProps = InlineProps;

/* eslint-disable react/no-unused-prop-types */
const propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  component: PropTypes.string,
  columnWidth: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]).isRequired,
  gutterWidth: PropTypes.number,
  gutterHeight: PropTypes.number,
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
  monitorImagesLoaded: PropTypes.bool,
  vendorPrefix: PropTypes.bool,
  userAgent: PropTypes.string,
  enableSSR: PropTypes.bool,
};
/* eslint-enable react/no-unused-prop-types */

export class GridInline extends Component<InlineDefaultProps, InlineProps, InlineState> {
  static defaultProps: InlineDefaultProps;

  static propTypes = {
    ...propTypes,
    size: PropTypes.shape({
      width: PropTypes.number,
      height: PropTypes.number,
    }),
  };

  props: InlineProps;
  state: InlineState;
  items: { [key: string]: GridItem; };
  imgLoad: Object;
  mounted: boolean;

  constructor(props: InlineProps) {
    super(props);

    this.items = {};
    this.imgLoad = {};
    this.mounted = false;
    this.state = this.doLayout(props);
  }

  componentDidMount() {
    this.mounted = true;
    this.updateLayout(this.props);
  }

  componentWillReceiveProps(nextProps: InlineProps) {
    if (!shallowequal(nextProps, this.props)) {
      this.updateLayout(nextProps);
    }
  }

  shouldComponentUpdate(nextProps: InlineProps, nextState: InlineState) {
    return (
      !shallowequal(nextProps, this.props) ||
      !shallowequal(nextState, this.state)
    );
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  setStateIfNeeded(state: Object) {
    if (this.mounted) {
      this.setState(state);
    }
  }

  getItemHeight(item: any): number {
    if (item.key && this.items.hasOwnProperty(item.key)) {
      const component = this.items[item.key];
      const el = (ReactDOM.findDOMNode(component): any);
      const candidate = [el.scrollHeight, el.clientHeight, el.offsetHeight, 0].filter(isNumber);

      return Math.max(...candidate);
    }

    return 0;
  }


  doLayout(props: InlineProps): InlineState {
    return ExecutionEnvironment.canUseDOM
      ? this.doLayoutForClient(props)
      : this.doLayoutForSSR(props);
  }

  doLayoutForClient(props: InlineProps): InlineState {
    const {
      size: { width: containerWidth },
      columnWidth: rawColumnWidth,
      gutterWidth,
      gutterHeight,
    } = props;

    const childArray = React.Children.toArray(props.children);
    const [maxColumn, columnWidth] = getColumnLengthAndWidth(
      containerWidth,
      rawColumnWidth,
      gutterWidth
    );
    const columnHeights = createArray(0, maxColumn);

    const rects = childArray.map((child) => {
      const column = columnHeights.indexOf(Math.min(...columnHeights));
      const height = this.getItemHeight(child);
      const left = (column * columnWidth) + (column * gutterWidth);
      const top = columnHeights[column];

      columnHeights[column] += Math.round(height) + gutterHeight;

      return { top, left, width: columnWidth, height };
    });

    const width = (maxColumn * columnWidth) + ((maxColumn - 1) * gutterWidth);
    const height = Math.max(...columnHeights) - gutterHeight;
    const finalRects = rects.map(o => ({
      ...o,
      left: o.left + ((containerWidth - width) / 2),
    }));

    return { rects: finalRects, actualWidth: width, height, columnWidth };
  }

  // eslint-disable-next-line class-methods-use-this
  doLayoutForSSR(props: InlineProps): InlineState {
    return {
      rects: React.Children.toArray(props.children).map(() => ({
        top: 0, left: 0, width: 0, height: 0,
      })),
      actualWidth: 0,
      height: 0,
      columnWidth: 0,
    };
  }

  updateLayout(props: InlineProps): void {
    this.setStateIfNeeded(this.doLayout(props));
  }

  handleItemResize = () => {
    this.updateLayout(this.props);
  };

  handleItemMounted = (item: GridItem) => {
    const { itemKey: key } = item.props;
    this.items[key] = item;

    if (this.props.monitorImagesLoaded && typeof imagesLoaded === 'function') {
      const node = ReactDOM.findDOMNode(item);
      const imgLoad = imagesLoaded(node);

      imgLoad.once('always', () => raf(() => {
        this.updateLayout(this.props);
      }));

      this.imgLoad[key] = imgLoad;
    }

    this.updateLayout(this.props);
  }

  handleItemUnmount = (item: GridItem) => {
    const { itemKey: key } = item.props;

    if (this.items.hasOwnProperty(key)) {
      delete this.items[key];
    }

    if (this.imgLoad.hasOwnProperty(key)) {
      this.imgLoad[key].off('always');
      delete this.imgLoad[key];
    }
  }

  render() {
    const {
      /* eslint-disable no-unused-vars */
      gutterWidth,
      gutterHeight,
      columnWidth: rawColumnWidth,
      monitorImagesLoaded,
      enableSSR,
      /* eslint-enable no-unused-vars */
      className,
      style,
      size,
      component,
      children,
      ...rest
    } = this.props;

    const { rects, actualWidth, height } = this.state;
    const containerSize = {
      actualWidth,
      width: size.width == null ? 0 : size.width,
      height,
    };
    const validChildren = React.Children
      .toArray(children)
      .filter(child => isValidElement(child));


    /* eslint-disable no-return-assign */
    return (
      <TransitionGroup
        component={component}
        className={className}
        style={{
          ...(style || {}),
          position: 'relative',
          transition: transition(['height'], rest.duration, easings.easeOut),
          height,
        }}
      >
        {validChildren.map((child, i) =>
          (<GridItem
            {...rest}
            index={i}
            key={child.key}
            itemKey={child.key}
            rect={rects[i]}
            containerSize={containerSize}
            onResize={this.handleItemResize}
            onMounted={this.handleItemMounted}
            onUnmount={this.handleItemUnmount}
          >
            {child}
          </GridItem>)
        )}
      </TransitionGroup>
    );
    /* eslint-enable no-return-assign */
  }
}

const SizeAwareGridInline = sizeMe({
  monitorWidth: true,
  monitorHeight: false,
})(GridInline);


const StackGrid = (props: Props) => {
  sizeMe.enableSSRBehaviour = props.enableSSR;

  return (
    <SizeAwareGridInline
      {...props}
    />
  );
};

StackGrid.propTypes = propTypes;

StackGrid.defaultProps = {
  style: {},
  component: 'div',
  columnWidth: 150,
  gutterWidth: 5,
  gutterHeight: 5,
  duration: 480,
  easing: easings.quartOut,
  appearDelay: 30,
  appear: transitions.fadeUp.appear,
  appeared: transitions.fadeUp.appeared,
  enter: transitions.fadeUp.enter,
  entered: transitions.fadeUp.entered,
  leaved: transitions.fadeUp.leaved,
  units: { length: 'px', angle: 'deg' },
  monitorImagesLoaded: false,
  vendorPrefix: true,
  userAgent: null,
  enableSSR: false,
};

export default StackGrid;
