"use strict";
// Module to handle keyboard, mouse, touch events.
// Useful for games.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var GameInput_1 = require("./GameInput");
var KeyInput_1 = require("./KeyInput");
var GpadInput_1 = require("./GpadInput");
var ElementInput_1 = require("./ElementInput");
/** Summarizes all device inputs for a single named input */
var GameInputGroup = /** @class */ (function (_super) {
    __extends(GameInputGroup, _super);
    function GameInputGroup(info) {
        var _this = _super.call(this) || this;
        /**
         * One of the devices for this input was pressed.
         * Should we change the state of this input to pressed and alert listeners?
         */
        _this.onDevicePress = function () {
            if (_this.isPressed)
                return;
            _this.isPressed = true;
            // Notify any listeners of pressed event
            var listeners = inputListeners.press[_this.name];
            if (!listeners)
                return;
            for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
                var f = listeners_1[_i];
                f(_this.name);
            }
        };
        /**
         * One of the devices for this input was released.
         * Should we change the state of this input to released and alert listeners
         * or are there still other pressed devices...
         */
        _this.onDeviceRelease = function () {
            if (!_this.isPressed)
                return;
            // Check if any devices remain pressed
            if (_this.anyPressed())
                return;
            // No - so this input is truly released
            _this.isPressed = false;
            // Notify any listeners of released event
            var listeners = inputListeners.release[_this.name];
            if (!listeners)
                return;
            for (var _i = 0, listeners_2 = listeners; _i < listeners_2.length; _i++) {
                var f = listeners_2[_i];
                f(_this.name);
            }
        };
        _this.name = info.name;
        _this.isPressed = false;
        _this.keys = info.keyCodes
            ? info.keyCodes.map(function (code) {
                var ki = KeyInput_1.default.create({
                    code: code,
                    onPress: _this.onDevicePress,
                    onRelease: _this.onDeviceRelease
                });
                return ki;
            })
            : [];
        _this.gpCtrls = info.gamepadControls
            ? info.gamepadControls.map(function (i) { return GpadInput_1.GpadInput.create(__assign({}, i, { onPress: _this.onDevicePress, onRelease: _this.onDeviceRelease })); })
            : [];
        _this.elements = info.elements
            ? Array.prototype.map.call(info.elements, function (el) { return new ElementInput_1.default({
                element: el,
                onPress: _this.onDevicePress,
                onRelease: _this.onDeviceRelease
            }); })
            : [];
        return _this;
    }
    GameInputGroup.prototype.value = function () {
        if (this.keys.some(function (k) { return k.pressed(); }))
            return 1;
        if (this.elements.some(function (el) { return el.pressed(); }))
            return 1;
        return this.gpCtrls.reduce(function (max, c) { return Math.max(max, c.value()); }, 0);
    };
    GameInputGroup.prototype.pressed = function () {
        return this.isPressed;
    };
    /** Scan for just this type of input */
    GameInputGroup.prototype.keyPressed = function () {
        return this.keys.some(function (k) { return k.pressed(); });
    };
    GameInputGroup.prototype.gpadCtrlPressed = function () {
        return this.gpCtrls.some(function (gc) { return gc.pressed(); });
    };
    GameInputGroup.prototype.elementPressed = function () {
        return this.elements.some(function (el) { return el.pressed(); });
    };
    /** Freshly computed value for isPressed */
    GameInputGroup.prototype.anyPressed = function () {
        return this.keyPressed() || this.gpadCtrlPressed() || this.elementPressed();
    };
    return GameInputGroup;
}(GameInput_1.default));
/** Dictionary of GameInputGroups indexed by name */
var inputs = Object.create(null);
/** Dictionary of GameInputGroup listeners */
var inputListeners = {
    press: Object.create(null),
    release: Object.create(null)
};
/** Get all input(s) with key controls having a specific keyCode */
function getInputsByKeyCode(code) {
    return Object.keys(inputs).reduce(function (inps, name) {
        if (inputs[name].keys.some(function (key) { return key.code === code; })) {
            inps.push(inputs[name]);
        }
        return inps;
    }, []);
}
/**
 * Creates a GameInputGroup associated with key code(s), gamepad control(s) and element(s).
 * This function returns nothing but you may then query input state or add listeners for this name.
 * If an input already exists with this name it will be replaced.
 */
function create(info) {
    var name = info.name;
    if (!name || typeof name !== 'string') {
        throw new Error("Invalid name for input.");
    }
    if (inputs[name]) {
        console.log("Replacing input '" + name + "'");
        destroy(name);
    }
    var input = new GameInputGroup(info);
    inputs[name] = input;
}
exports.create = create;
/**
 * Destroys a GameInputGroup
 */
function destroy(name) {
    if (!name || typeof name !== 'string') {
        throw new Error("Invalid name for input.");
    }
    var input = inputs[name];
    if (!input) {
        return false;
    }
    for (var _i = 0, _a = input.elements; _i < _a.length; _i++) {
        var ei = _a[_i];
        ei.destroy();
    }
    for (var _b = 0, _c = input.keys; _b < _c.length; _b++) {
        var ki = _c[_b];
        KeyInput_1.default.destroy(ki);
    }
    delete inputs[name];
    return true;
}
exports.destroy = destroy;
/** Must poll to detect (gamepad) input press/release changes */
function poll() {
    var inputNames = Object.keys(inputs);
    for (var _i = 0, inputNames_1 = inputNames; _i < inputNames_1.length; _i++) {
        var name_1 = inputNames_1[_i];
        var input = inputs[name_1];
        for (var _a = 0, _b = input.gpCtrls; _a < _b.length; _a++) {
            var gp = _b[_a];
            gp.poll();
        }
    }
}
exports.poll = poll;
/**
 * Gets the pressed state of the named input
 */
function pressed(name) {
    var i = inputs[name];
    return i ? i.pressed() : false;
}
exports.pressed = pressed;
/**
 * Gets the current value of the named input
 */
function value(name) {
    var i = inputs[name];
    return i ? i.value() : 0;
}
exports.value = value;
/**
 * Get pressed states for all input names in the provided object
 */
function getPressed(obj) {
    for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
        var name_2 = _a[_i];
        obj[name_2] = pressed(name_2);
    }
    return obj;
}
exports.getPressed = getPressed;
/**
 * Get values for all input names in the provided object
 */
function getValues(obj) {
    for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
        var name_3 = _a[_i];
        obj[name_3] = value(name_3);
    }
    return obj;
}
exports.getValues = getValues;
/**
 * Add an input listener.
 */
function on(name, type, listener) {
    // Be a helpful public API
    if (!name || typeof name !== 'string') {
        throw new Error("Invalid input name.");
    }
    if (type !== 'press' && type !== 'release') {
        throw new Error("Invalid input event type.");
    }
    if (!inputs[name]) {
        console.warn("Adding " + type + " listener for input '" + name + "' which doesn't exist (yet?)");
    }
    // Add to the listener dictionary
    var list = inputListeners[type][name];
    if (!list) {
        inputListeners[type][name] = list = [];
    }
    else {
        if (list.some(function (l) { return l === listener; })) {
            console.warn("Already added this " + type + " listener for input name: " + name);
            return;
        }
    }
    list.push(listener);
}
exports.on = on;
/**
 * Remove an input listener.
 */
function off(name, type, listener) {
    // Be a helpful public API
    if (!name || typeof name !== 'string') {
        throw new Error("Invalid input name.");
    }
    if (type !== 'press' && type !== 'release') {
        throw new Error("Invalid input event type.");
    }
    // Remove from listener dictionary
    var list = inputListeners[type][name];
    if (!list) {
        console.warn(type + " listener not found for input name: " + name);
        return;
    }
    var i = list.indexOf(listener);
    if (i < 0) {
        console.warn(type + " listener not found for input name: " + name);
        return;
    }
    list.splice(i, 1);
}
exports.off = off;
