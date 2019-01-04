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
    function KeyInput(code) {
        var _this = _super.call(this) || this;
        _this.code = code;
        _this.isPressed = false;
        return _this;
    }
    KeyInput.prototype.pressed = function () {
        return this.isPressed;
    };
    KeyInput.prototype.value = function () {
        return this.pressed() ? 1 : 0;
    };
    KeyInput.onKeyDown = function (e) {
        var code = e.keyCode;
        if (!KeyInput.keyboardState[code]) {
            // this key state changed
            KeyInput.keyboardState[code] = true;
            if (KeyInput.listeners.keydown) {
                return KeyInput.listeners.keydown(e);
            }
        }
    };
    KeyInput.onKeyUp = function (e) {
        var code = e.keyCode;
        if (KeyInput.keyboardState[code]) {
            KeyInput.keyboardState[code] = false;
            if (KeyInput.listeners.keyup) {
                return KeyInput.listeners.keyup(e);
            }
        }
    };
    /**
     * Add the global key event listeners.
     * Required to handle keyboard events.
     */
    KeyInput.addKeyListeners = function (l) {
        if (KeyInput.listeners.keydown || KeyInput.listeners.keyup) {
            console.warn("Key listeners already added.");
            return;
        }
        KeyInput.listeners.keydown = l.keydown;
        KeyInput.listeners.keyup = l.keyup;
        document.addEventListener('keydown', KeyInput.onKeyDown, true);
        document.addEventListener('keyup', KeyInput.onKeyUp, true);
    };
    /**
     * Remove the global key event listeners.
     */
    KeyInput.removeKeyListeners = function (l) {
        if (!KeyInput.listeners.keydown) {
            console.warn("Key listeners were not yet added.");
            return;
        }
        document.removeEventListener('keyup', KeyInput.onKeyUp, true);
        document.removeEventListener('keydown', KeyInput.onKeyDown, true);
        KeyInput.listeners.keyup = undefined;
        KeyInput.listeners.keydown = undefined;
    };
    KeyInput.listeningKeys = function () {
        return !!KeyInput.listeners.keydown || KeyInput.listeners.keyup;
    };
    /** State of all keys indexed by key code */
    KeyInput.keyboardState = new Array(256).fill(false);
    KeyInput.listeners = {
        keydown: undefined,
        keyup: undefined
    };
    return KeyInput;
}(GameInput_1.default));
exports.default = KeyInput;
