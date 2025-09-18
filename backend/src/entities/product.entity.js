"use strict";
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
exports.ProductEntity = void 0;
var ProductEntity = /** @class */ (function () {
    function ProductEntity(partial) {
        var _a;
        Object.assign(this, partial);
        this.createdAt = this.createdAt || new Date();
        this.updatedAt = new Date();
        this.views = this.views || 0;
        this.likes = this.likes || 0;
        this.status = this.status || 'draft';
        this.price = __assign(__assign({}, this.price), { currency: ((_a = this.price) === null || _a === void 0 ? void 0 : _a.currency) || 'INR' });
    }
    return ProductEntity;
}());
exports.ProductEntity = ProductEntity;
