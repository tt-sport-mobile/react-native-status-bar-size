/**
 * @providesModule StatusBarSizeIOS
 * @flow
 */
'use strict';

const { NativeEventEmitter, NativeModules } = require('react-native');
const { RNStatusBarSize } = NativeModules;
const StatusBarEmitter = new NativeEventEmitter(RNStatusBarSize);

var DEVICE_STATUS_BAR_HEIGHT_EVENTS = {
  willChange: 'statusBarSizeWillChange',
  didChange: 'statusBarSizeDidChange',
  change: 'statusBarSizeDidChange'
};

var _statusBarSizeHandlers: Map<Function, Object> = new Map();
var noop = function() {};

/**
 * `StatusBarSizeIOS` can tell you what the current height of the status bar
 * is, so that you can adjust your layout accordingly when a phone call
 * notification comes up, for example.
 *
 * ### Basic Usage
 *
 * To see the current height, you can check `StatusBarSizeIOS.currentHeight`, which
 * will be kept up-to-date. However, `currentHeight` will be null at launch
 * while `StatusBarSizeIOS` retrieves it over the bridge.
 *
 * ```
 * getInitialState: function() {
 *   return {
 *     currentStatusBarHeight: StatusBarSizeIOS.currentHeight,
 *   };
 * },
 * componentDidMount: function() {
 *   StatusBarSizeIOS.addEventListener('willChange', this._handleStatusBarSizeWillChange);
 *   StatusBarSizeIOS.addEventListener('didChange', this._handleStatusBarSizeDidChange);
 * },
 * componentWillUnmount: function() {
 *   StatusBarSizeIOS.removeEventListener('willChange', this._handleStatusBarSizeWillChange);
 *   StatusBarSizeIOS.removeEventListener('didChange', this._handleStatusBarSizeDidChange);
 * },
 * _handleStatusBarSizeWillChange: function(upcomingStatusBarHeight) {
 *   console.log('Upcoming StatusBar Height:' + upcomingStatusBarHeight);
 * },
 * _handleStatusBarSizeDidChange: function(currentStatusBarHeight) {
 *   this.setState({ currentStatusBarHeight, });
 * },
 * render: function() {
 *   return (
 *     <Text>Current status bar height is: {this.state.currentStatusBarHeight}</Text>
 *   );
 * },
 * ```
 *
 * Open up the phone call status bar in the simulator to see it change.
 */

var StatusBarSizeIOS = {

  /**
   * Add a handler to Status Bar size changes by listening to the event type
   * and providing the handler.
   *
   * Possible event types: change (deprecated), willChange, didChange
   */
  addEventListener: function(
    type: string,
    handler: Function
  ) {
    _statusBarSizeHandlers.set(handler, StatusBarEmitter.addListener(
      DEVICE_STATUS_BAR_HEIGHT_EVENTS[type],
      (statusBarSizeData) => {
        handler(statusBarSizeData.height);
      }
    ));
  },

  /**
   * Remove a handler by passing the event type and the handler
   */
  removeEventListener: function(
    type: string,
    handler: Function
  ) {
    if (!_statusBarSizeHandlers.get(handler)) {
      return;
    }
    _statusBarSizeHandlers.delete(handler);
  },

  currentHeight: (null : ?number),

};

StatusBarEmitter.addListener(
  DEVICE_STATUS_BAR_HEIGHT_EVENTS.didChange,
  (statusBarData) => {
    StatusBarSizeIOS.currentHeight = statusBarData.height;
  }
);
//Wrap in try catch to avoid error on android
try {
  RNStatusBarSize.getCurrentStatusBarHeight(
    (statusBarData) => {
      StatusBarSizeIOS.currentHeight = statusBarData.height;
    },
    noop
  );
} catch (e) {

}

module.exports = StatusBarSizeIOS;
