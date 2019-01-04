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
var gpad = require("./gpad");
var GameInput_1 = require("./GameInput");
function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
}
var GpadInput = /** @class */ (function (_super) {
    __extends(GpadInput, _super);
    function GpadInput(info) {
        var _this = _super.call(this) || this;
        _this.gamepadId = info.gamepadId;
        return _this;
    }
    GpadInput.prototype.pressed = function () {
        return this.value() > 0.75;
    };
    GpadInput.create = function (info) {
        return info.type === 'axis'
            ? new GpadInputAxis(info) : new GpadInputButton(info);
    };
    return GpadInput;
}(GameInput_1.default));
exports.GpadInput = GpadInput;
var GpadInputButton = /** @class */ (function (_super) {
    __extends(GpadInputButton, _super);
    function GpadInputButton(info) {
        var _this = _super.call(this, info) || this;
        _this.type = 'button';
        _this.buttonId = info.buttonId;
        return _this;
    }
    GpadInputButton.prototype.value = function () {
        var gp = gpad.getGamepadById(this.gamepadId);
        return gp ? clamp(gp.buttons[this.buttonId].value, 0, 1) : 0;
    };
    return GpadInputButton;
}(GpadInput));
exports.GpadInputButton = GpadInputButton;
var GpadInputAxis = /** @class */ (function (_super) {
    __extends(GpadInputAxis, _super);
    function GpadInputAxis(info) {
        var _this = _super.call(this, info) || this;
        _this.type = 'axis';
        _this.axisId = info.axisId;
        _this.axisSign = info.axisSign;
        return _this;
    }
    GpadInputAxis.prototype.value = function () {
        var gp = gpad.getGamepadById(this.gamepadId);
        return gp ? clamp(gp.axes[this.axisId] * this.axisSign, 0, 1) : 0;
    };
    return GpadInputAxis;
}(GpadInput));
exports.GpadInputAxis = GpadInputAxis;
