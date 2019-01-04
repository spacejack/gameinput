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
            for (var _i = 0, _a = _this.listeners.press; _i < _a.length; _i++) {
                var l = _a[_i];
                l.callback(_this.name);
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
            // Check if any other keys are down
            if (_this.keyPressed())
                return;
            // Check if any elements are pressed
            if (_this.elementPressed())
                return;
            // Or any gamepad controls are pressed
            if (_this.gpadCtrlPressed())
                return;
            // No - so this input is truly released
            _this.isPressed = false;
            for (var _i = 0, _a = _this.listeners.release; _i < _a.length; _i++) {
                var l = _a[_i];
                l.callback(_this.name);
            }
        };
        _this.name = name;
        _this.isPressed = false;
        _this.keys = info.keyCodes
            ? info.keyCodes.map(function (code) { return new KeyInput_1.default(code); })
            : [];
        _this.gpCtrls = info.gamepadControls
            ? info.gamepadControls.map(function (i) { return GpadInput_1.GpadInput.create(i); })
            : [];
        _this.elements = info.elements
            ? info.elements.map(function (el) { return new ElementInput_1.default({
                element: el,
                onPress: _this.onDevicePress,
                onRelease: _this.onDeviceRelease
            }); })
            : [];
        _this.listeners = {
            press: [],
            release: []
        };
        return _this;
    }
    GameInputGroup.prototype.value = function () {
        for (var _i = 0, _a = this.keys; _i < _a.length; _i++) {
            var key = _a[_i];
            if (KeyInput_1.default.keyboardState[key.code])
                return 1;
        }
        for (var _b = 0, _c = this.elements; _b < _c.length; _b++) {
            var el = _c[_b];
            if (el.pressed())
                return 1;
        }
        var v = 0;
        for (var _d = 0, _e = this.gpCtrls; _d < _e.length; _d++) {
            var gpc = _e[_d];
            v = Math.max(v, gpc.value());
        }
        return v;
    };
    GameInputGroup.prototype.pressed = function () {
        return this.isPressed;
    };
    /** Find if a key associated with this input is pressed */
    GameInputGroup.prototype.keyPressed = function () {
        return this.keys.some(function (k) { return KeyInput_1.default.keyboardState[k.code]; });
    };
    GameInputGroup.prototype.gpadCtrlPressed = function () {
        return this.gpCtrls.some(function (gc) { return gc.pressed(); });
    };
    GameInputGroup.prototype.elementPressed = function () {
        return this.elements.some(function (el) { return el.pressed(); });
    };
    return GameInputGroup;
}(GameInput_1.default));
/** Dictionary of GameInputs indexed by name */
var inputs = Object.create(null);
function onKeyDown(e) {
    for (var _i = 0, _a = getInputsByKeyCode(e.keyCode); _i < _a.length; _i++) {
        var input = _a[_i];
        input.onDevicePress();
    }
}
function onKeyUp(e) {
    for (var _i = 0, _a = getInputsByKeyCode(e.keyCode); _i < _a.length; _i++) {
        var input = _a[_i];
        input.onDeviceRelease();
    }
}
/** Get all input(s) with key controls having a specific keyCode */
function getInputsByKeyCode(code) {
    var inps = [];
    for (var _i = 0, _a = Object.keys(inputs); _i < _a.length; _i++) {
        var name_1 = _a[_i];
        var input = inputs[name_1];
        var kcs = input.keys;
        for (var j = 0; j < kcs.length; ++j) {
            if (kcs[j].code === code) {
                inps.push(input);
                break;
            }
        }
    }
    return inps;
}
/** Must poll to detect (gamepad) input press/release changes */
function poll() {
    var inputNames = Object.keys(inputs);
    for (var _i = 0, inputNames_1 = inputNames; _i < inputNames_1.length; _i++) {
        var name_2 = inputNames_1[_i];
        var input = inputs[name_2];
        if (input.gpCtrls.some(function (gc) { return gc.pressed(); })) {
            input.onDevicePress();
        }
        else {
            input.onDeviceRelease();
        }
    }
}
exports.poll = poll;
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
    if (!KeyInput_1.default.listeningKeys() && info.keyCodes && info.keyCodes.length > 0) {
        KeyInput_1.default.addKeyListeners({
            keydown: onKeyDown,
            keyup: onKeyUp
        });
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
        ei.removeListeners();
    }
    delete inputs[name];
    // If we've removed all inputs with keys, we can disable key listeners
    if (!KeyInput_1.default.listeningKeys()) {
        return; // Not listening to keys, so exit
    }
    for (var _b = 0, _c = Object.keys(inputs); _b < _c.length; _b++) {
        var n = _c[_b];
        var i = inputs[n];
        if (i.keys.length > 0)
            return;
    }
    KeyInput_1.default.removeKeyListeners({
        keydown: onKeyDown, keyup: onKeyUp
    });
    return true;
}
exports.destroy = destroy;
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
        var name_3 = _a[_i];
        obj[name_3] = pressed(name_3);
    }
    return obj;
}
exports.getPressed = getPressed;
/**
 * Get values for all input names in the provided object
 */
function getValues(obj) {
    for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
        var name_4 = _a[_i];
        obj[name_4] = value(name_4);
    }
    return obj;
}
exports.getValues = getValues;
/**
 * Attach an input listener callback.
 */
function on(name, type, callback) {
    if (!name || typeof name !== 'string') {
        throw new Error("Invalid input name.");
    }
    if (type !== 'press' && type !== 'release') {
        throw new Error("Invalid input event type.");
    }
    var input = inputs[name];
    if (!input) {
        throw new Error("Input with name '" + name + "' not found.");
    }
    if (input.listeners[type].some(function (l) { return l.type === type && l.callback === callback; })) {
        console.warn("Already added this listener.");
        return;
    }
    input.listeners[type].push({ type: type, callback: callback });
}
exports.on = on;
/**
 * Detach an input listener callback.
 */
function off(name, type, callback) {
    var input = inputs[name];
    if (!input) {
        console.warn("Input not found with name " + name);
    }
    var ls = input.listeners[type];
    for (var i = ls.length - 1; i >= 0; --i) {
        var l = ls[i];
        if (l.callback === callback) {
            ls.splice(i, 1);
            return;
        }
    }
    console.warn("Listener not found for input '" + name + "' with type " + type + ", cannot remove.");
}
exports.off = off;
