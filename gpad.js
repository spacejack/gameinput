"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supported = typeof navigator !== 'undefined' && !!navigator.getGamepads; //|| !!navigator['webkitGetGamepads']
var gamepads = [];
var connectedGamepads = [];
/** Counter/flag to throttle getGamepads to once/RAF */
var numSearches = 0;
/** Only warn unsupported once */
var unsupportedWarningLogged = false;
/** List of event listeners */
var connectListeners = [];
/** Used for internal listener */
var connectListener;
/**
 * Search for connected Gamepads.
 * This will update the `gamepads` and `connectedGamepads` arrays.
 */
function searchGamepads() {
    if (exports.supported) {
        gamepads = Array.from(navigator.getGamepads()); //.filter(gp => !!gp) as Gamepad[]
        connectedGamepads = gamepads.filter(function (gp) { return gp != null; });
    }
    else {
        if (!unsupportedWarningLogged) {
            console.warn("Gamepad unsupported");
            unsupportedWarningLogged = true;
        }
        gamepads = [];
        connectedGamepads = [];
    }
    //  Gamepad API not found
    return gamepads;
}
exports.searchGamepads = searchGamepads;
/** Throttled getGamepads, and returns a real array */
function getGamepads() {
    if (numSearches > 0) {
        // Already searched this frame
        return gamepads;
    }
    searchGamepads();
    numSearches = 1;
    Promise.resolve().then(function () { numSearches = 0; });
    return gamepads;
}
exports.getGamepads = getGamepads;
/**
 * Returns Gamepad list from the last poll
 */
function getConnectedGamepads() {
    if (numSearches > 0) {
        // Already searched this frame
        return connectedGamepads;
    }
    searchGamepads();
    numSearches = 1;
    Promise.resolve().then(function () { numSearches = 0; });
    return connectedGamepads;
}
exports.getConnectedGamepads = getConnectedGamepads;
/** Get a Gamepad by ID */
function getGamepadById(id) {
    return getConnectedGamepads().find(function (gp) { return gp.id === id; });
}
exports.getGamepadById = getGamepadById;
/** Get a Gamepad by index */
function getGamepadByIndex(index) {
    getConnectedGamepads();
    return gamepads[index] || undefined;
}
exports.getGamepadByIndex = getGamepadByIndex;
/** Get the first Gamepad found */
function getFirstGamepad() {
    return getConnectedGamepads()[0] || undefined;
}
exports.getFirstGamepad = getFirstGamepad;
function onGamepadConnectChange(e) {
    searchGamepads();
    for (var _i = 0, connectListeners_1 = connectListeners; _i < connectListeners_1.length; _i++) {
        var cb = connectListeners_1[_i];
        cb(connectedGamepads);
    }
}
/** Listen for a gamepad event */
function on(eventName, fn) {
    var i = connectListeners.indexOf(fn);
    if (i >= 0)
        return false;
    connectListeners.push(fn);
    if (connectListeners.length === 1) {
        // Starting new list - add global listeners
        window.addEventListener('gamepadconnected', onGamepadConnectChange);
        window.addEventListener('gamepaddisconnected', onGamepadConnectChange);
    }
    return true;
}
exports.on = on;
/** Stop listening for a gamepad event */
function off(eventName, fn) {
    var i = connectListeners.indexOf(fn);
    if (i < 0)
        return false;
    connectListeners.splice(i, 1);
    if (connectListeners.length === 0) {
        // List is now empty, remove global listeners
        window.removeEventListener('gamepadconnected', onGamepadConnectChange);
        window.removeEventListener('gamepaddisconnected', onGamepadConnectChange);
    }
    return true;
}
exports.off = off;
/**
 * Enable/disable constant listening for connect changes.
 * Pass no argument to return listening state.
 */
function listen(enable) {
    if (enable == null || enable === !!connectListener) {
        return !!connectListener;
    }
    if (connectListener) {
        off('connectchange', connectListener);
        connectListener = undefined;
    }
    else {
        connectListener = function () { };
        on('connectchange', connectListener);
    }
    return !!connectListener;
}
exports.listen = listen;
