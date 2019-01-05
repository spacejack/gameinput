"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Simple custom event emitter */
var InputEmitter = /** @class */ (function () {
    function InputEmitter() {
        this.listeners = Object.create(null);
    }
    InputEmitter.prototype.on = function (id, cb) {
        if (!id || typeof id !== 'string' || typeof cb !== 'function') {
            throw new Error('Invalid params');
        }
        var cbs = this.listeners[id];
        if (!cbs) {
            cbs = [cb];
            this.listeners[id] = cbs;
        }
        else {
            if (cbs.indexOf(cb) < 0) {
                cbs.push(cb);
            }
        }
    };
    InputEmitter.prototype.once = function (id, cb) {
        var _this = this;
        if (typeof cb !== 'function') {
            throw new Error('Invalid callback');
        }
        var f = function (data) {
            _this.off(id, f);
            cb(data);
        };
        this.on(id, f);
    };
    InputEmitter.prototype.off = function (id, cb) {
        if (!id || typeof id !== 'string' || typeof cb !== 'function') {
            throw new Error('Invalid params');
        }
        var cbs = this.listeners[id];
        if (!cbs) {
            return;
        }
        var i = cbs.indexOf(cb);
        if (i < 0) {
            return;
        }
        if (cbs.length < 2) {
            delete this.listeners[id];
            return;
        }
        cbs.splice(i, 1);
    };
    InputEmitter.prototype.emit = function (id, data) {
        var cbs = this.listeners[id];
        if (!cbs) {
            return;
        }
        for (var _i = 0, _a = this.listeners[id]; _i < _a.length; _i++) {
            var cb = _a[_i];
            cb(data);
        }
    };
    return InputEmitter;
}());
exports.default = InputEmitter;
