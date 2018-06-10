// @flow
import React from 'react'
import { View, PanResponder } from 'react-native'

type PanResponderT = any
type PanResponderGestureStateT = any
type ReactNativeEventT = any

export const swipeDirections = {
  SWIPE_UP: 'SWIPE_UP',
  SWIPE_DOWN: 'SWIPE_DOWN',
  SWIPE_LEFT: 'SWIPE_LEFT',
  SWIPE_RIGHT: 'SWIPE_RIGHT',
}

type SwipeDirectionT = $Keys<typeof swipeDirections>

const defaultSwipeConfig = {
  velocityThreshold: 0.3,
  directionalOffsetThreshold: 80,
  detectSwipeUp: true,
  detectSwipeDown: true,
  detectSwipeLeft: true,
  detectSwipeRight: true,
}

const isValidSwipe = (velocity, velocityThreshold, directionalOffset, directionalOffsetThreshold) => (
  (Math.abs(velocity) > velocityThreshold) &&
  (Math.abs(directionalOffset) < directionalOffsetThreshold)
)

const gestureIsClick = gestureState => Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5

type ConfigT = {
  velocityThreshold: number,
  directionalOffsetThreshold: number,
  detectSwipeUp: boolean,
  detectSwipeDown: boolean,
  detectSwipeLeft: boolean,
  detectSwipeRight: boolean,
}

type PropsT = {
  onSwipe?: (SwipeDirectionT, PanResponderGestureStateT) => void,
  onSwipeUp?: (PanResponderGestureStateT) => void,
  onSwipeDown?: (PanResponderGestureStateT) => void,
  onSwipeLeft?: (PanResponderGestureStateT) => void,
  onSwipeRight?: (PanResponderGestureStateT) => void,
  config?: ConfigT,
}

export class GestureRecognizer extends React.Component<PropsT> {
  constructor(props: PropsT) {
    super(props)
    this.swipeConfig = Object.assign(defaultSwipeConfig, props.config)
  }

  componentWillMount() {
    const responderEnd = this._handlePanResponderEnd.bind(this)
    const shouldSetResponder = this._handleShouldSetPanResponder.bind(this)
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: shouldSetResponder,
      onMoveShouldSetPanResponder: shouldSetResponder,
      onPanResponderRelease: responderEnd,
      onPanResponderTerminate: responderEnd,
    })
  }

  componentWillReceiveProps(props: PropsT) {
    this.swipeConfig = Object.assign(defaultSwipeConfig, props.config)
  }

  _panResponder: PanResponderT
  swipeConfig: ConfigT

  _handleShouldSetPanResponder(evt: ReactNativeEventT, gestureState: PanResponderGestureStateT) {
    return (
      evt.nativeEvent.touches.length === 1 &&
      !gestureIsClick(gestureState) &&
      this._validateSwipe(gestureState)
    )
  }

  _validateSwipe(gestureState: PanResponderGestureStateT) {
    const {
      detectSwipeUp,
      detectSwipeDown,
      detectSwipeLeft,
      detectSwipeRight,
    } = this.swipeConfig
    const swipeDirection = this._getSwipeDirection(gestureState)
    const { SWIPE_LEFT, SWIPE_RIGHT, SWIPE_UP, SWIPE_DOWN } = swipeDirections
    return (
      (detectSwipeUp && swipeDirection === SWIPE_UP) ||
      (detectSwipeDown && swipeDirection === SWIPE_DOWN) ||
      (detectSwipeLeft && swipeDirection === SWIPE_LEFT) ||
      (detectSwipeRight && swipeDirection === SWIPE_RIGHT)
    )
  }

  _handlePanResponderEnd(evt: ReactNativeEventT, gestureState: PanResponderGestureStateT) {
    const swipeDirection = this._getSwipeDirection(gestureState)
    this._triggerSwipeHandlers(swipeDirection, gestureState)
  }

  _triggerSwipeHandlers(swipeDirection: ?SwipeDirectionT, gestureState: PanResponderGestureStateT) {
    const {
      onSwipe,
      onSwipeUp,
      onSwipeDown,
      onSwipeLeft,
      onSwipeRight,
    } = this.props
    const { SWIPE_LEFT, SWIPE_RIGHT, SWIPE_UP, SWIPE_DOWN } = swipeDirections
    if (onSwipe && swipeDirection) onSwipe(swipeDirection, gestureState)
    switch (swipeDirection) {
      case SWIPE_LEFT:
        if (onSwipeLeft) onSwipeLeft(gestureState)
        break
      case SWIPE_RIGHT:
        if (onSwipeRight) onSwipeRight(gestureState)
        break
      case SWIPE_UP:
        if (onSwipeUp) onSwipeUp(gestureState)
        break
      case SWIPE_DOWN:
        if (onSwipeDown) onSwipeDown(gestureState)
        break
      default:
        break
    }
  }

  _getSwipeDirection(gestureState: PanResponderGestureStateT): ?SwipeDirectionT {
    const { SWIPE_LEFT, SWIPE_RIGHT, SWIPE_UP, SWIPE_DOWN } = swipeDirections
    const { dx, dy } = gestureState
    if (this._isValidHorizontalSwipe(gestureState)) {
      return dx > 0 ? SWIPE_RIGHT : SWIPE_LEFT
    } else if (this._isValidVerticalSwipe(gestureState)) {
      return dy > 0 ? SWIPE_DOWN : SWIPE_UP
    }
    return null
  }

  _isValidHorizontalSwipe(gestureState: PanResponderGestureStateT) {
    const { vx, dy } = gestureState
    const { velocityThreshold, directionalOffsetThreshold } = this.swipeConfig
    return isValidSwipe(vx, velocityThreshold, dy, directionalOffsetThreshold)
  }

  _isValidVerticalSwipe(gestureState: PanResponderGestureStateT) {
    const { vy, dx } = gestureState
    const { velocityThreshold, directionalOffsetThreshold } = this.swipeConfig
    return isValidSwipe(vy, velocityThreshold, dx, directionalOffsetThreshold)
  }

  render() {
    return <View {...this.props} {...this._panResponder.panHandlers} />
  }
}
