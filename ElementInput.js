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
var DEVICE_NONE = 0;
var DEVICE_MOUSE = 1;
var DEVICE_TOUCH = 2;
var ElementInput = /** @class */ (function (_super) {
    __extends(ElementInput, _super);
    function ElementInput(info) {
        var _this = _super.call(this, info) || this;
        _this.element = info.element;
        _this.isPressed = false;
        _this.device = DEVICE_NONE;
        _this.devListeners = {
            mousedown: function () {
                _this.onPressElement(DEVICE_MOUSE);
            },
            mouseup: function () {
                _this.onReleaseElement(DEVICE_MOUSE);
            },
            touchstart: function () {
                _this.onPressElement(DEVICE_TOUCH);
            },
            touchend: function () {
                _this.onReleaseElement(DEVICE_TOUCH);
            },
            touchmove: function (e) {
                // Prevent dragging of this element
                e.preventDefault();
            }
        };
        // Prevent unwanted iOS events
        snuffiOSEvents(_this.element);
        // Add the mouse/touch listeners to the element
        for (var _i = 0, _a = Object.keys(_this.listeners); _i < _a.length; _i++) {
            var key = _a[_i];
            _this.element.addEventListener(key, _this.devListeners[key]);
        }
        return _this;
    }
    ElementInput.prototype.pressed = function () {
        return this.isPressed;
    };
    ElementInput.prototype.value = function () {
        return this.isPressed ? 1 : 0;
    };
    /** Should call this when this input is destroyed */
    ElementInput.prototype.destroy = function () {
        for (var _i = 0, _a = Object.keys(this.listeners); _i < _a.length; _i++) {
            var key = _a[_i];
            this.element.removeEventListener(key, this.devListeners[key]);
        }
        unSnuffiOSEvents(this.element);
    };
    ElementInput.prototype.onPressElement = function (device) {
        if (this.device !== DEVICE_NONE && this.device !== device)
            return;
        this.device = device;
        this.isPressed = true;
        this.emit('press');
    };
    ElementInput.prototype.onReleaseElement = function (device) {
        var _this = this;
        if (this.device !== DEVICE_NONE && this.device !== device)
            return;
        this.isPressed = false;
        setTimeout(function () {
            // iOS will fire a delayed mouse event after touchend.
            // Delaying the device reset will ignore that mouse event.
            _this.device = DEVICE_NONE;
        }, 500);
        this.emit('release');
    };
    return ElementInput;
}(GameInput_1.default));
exports.default = ElementInput;
var isIOS = !!navigator.userAgent.match(/iPhone|iPad|iPod/i);
/** iOS troublesome events to prevent */
var IOS_SNUFF_EVENTS = ['dblclick'];
exports.config = {
    /** Change this before creating ElementInputs to disable iOS special handling */
    iOSSpecial: true
};
/**
 * iOS fudge - prevents unwanted events on the given element
 */
function snuffiOSEvents(el) {
    if (!isIOS || !exports.config.iOSSpecial)
        return;
    IOS_SNUFF_EVENTS.forEach(function (name) {
        el.addEventListener(name, eatEvent);
    });
}
/**
 * Cleaup iOS fudge
 */
function unSnuffiOSEvents(el) {
    if (!isIOS || !exports.config.iOSSpecial)
        return;
    IOS_SNUFF_EVENTS.forEach(function (name) {
        el.removeEventListener(name, eatEvent);
    });
}
var eatEvent = function (e) {
    e.preventDefault();
};
