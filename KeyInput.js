"use strict";
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
var KeyInput = /** @class */ (function (_super) {
    __extends(KeyInput, _super);
    function KeyInput(info) {
        var _this = _super.call(this, info) || this;
        _this.code = info.code;
        _this.isPressed = false;
        return _this;
    }
    KeyInput.prototype.pressed = function () {
        return this.isPressed;
    };
    KeyInput.prototype.value = function () {
        return this.pressed() ? 1 : 0;
    };
    // override for types
    KeyInput.prototype.on = function (id, cb) {
        _super.prototype.on.call(this, id, cb);
    };
    KeyInput.prototype.off = function (id, cb) {
        _super.prototype.off.call(this, id, cb);
    };
    KeyInput.prototype.onKeyPress = function (e) {
        if (this.isPressed)
            return;
        this.isPressed = true;
        this.emit('press', e);
    };
    KeyInput.prototype.onKeyRelease = function (e) {
        if (!this.isPressed)
            return;
        this.isPressed = false;
        this.emit('release', e);
    };
    KeyInput.onKeyDown = function (e) {
        var code = e.keyCode;
        if (!KeyInput.keyboardState[code]) {
            // this key state changed
            KeyInput.keyboardState[code] = true;
            for (var _i = 0, _a = KeyInput.keyInputs; _i < _a.length; _i++) {
                var ki = _a[_i];
                if (ki.code === code) {
                    ki.onKeyPress(e);
                }
            }
        }
    };
    KeyInput.onKeyUp = function (e) {
        var code = e.keyCode;
        if (KeyInput.keyboardState[code]) {
            // this key state changed
            KeyInput.keyboardState[code] = false;
            for (var _i = 0, _a = KeyInput.keyInputs; _i < _a.length; _i++) {
                var ki = _a[_i];
                if (ki.code === code) {
                    ki.onKeyRelease(e);
                }
            }
        }
    };
    /**
     * Add the global key event listeners.
     */
    KeyInput.addKeyListeners = function () {
        document.addEventListener('keydown', KeyInput.onKeyDown, true);
        document.addEventListener('keyup', KeyInput.onKeyUp, true);
    };
    /**
     * Remove the global key event listeners.
     */
    KeyInput.removeKeyListeners = function () {
        document.removeEventListener('keyup', KeyInput.onKeyUp, true);
        document.removeEventListener('keydown', KeyInput.onKeyDown, true);
    };
    KeyInput.listeningKeys = function () {
        return KeyInput.keyInputs.length > 0;
    };
    KeyInput.create = function (info) {
        var ki = new KeyInput(info);
        KeyInput.keyInputs.push(ki);
        if (KeyInput.keyInputs.length === 1) {
            // First key being listened for, add global listeners
            KeyInput.addKeyListeners();
        }
        return ki;
    };
    /** Cleanup this key listener */
    KeyInput.destroy = function (ki) {
        var i = KeyInput.keyInputs.indexOf(ki);
        if (i < 0) {
            console.warn('KeyInput not found');
            return;
        }
        KeyInput.keyInputs.splice(i, 1);
        if (KeyInput.keyInputs.length < 1) {
            // No more keys to listen for, remove global listeners
            KeyInput.removeKeyListeners();
        }
    };
    /** State of all keys indexed by key code */
    KeyInput.keyboardState = new Array(256).fill(false);
    KeyInput.keyInputs = [];
    return KeyInput;
}(GameInput_1.default));
exports.default = KeyInput;
