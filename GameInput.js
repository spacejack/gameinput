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
var InputEmitter_1 = require("./InputEmitter");
var GameInput = /** @class */ (function (_super) {
    __extends(GameInput, _super);
    function GameInput(info) {
        if (info === void 0) { info = {}; }
        var _this = _super.call(this) || this;
        if (info.onPress) {
            _this.on('press', info.onPress);
        }
        if (info.onRelease) {
            _this.on('release', info.onRelease);
        }
        return _this;
    }
    return GameInput;
}(InputEmitter_1.default));
exports.default = GameInput;
