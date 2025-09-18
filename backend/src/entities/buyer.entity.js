"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyerEntity = void 0;
var BuyerEntity = /** @class */ (function () {
    function BuyerEntity(partial) {
        Object.assign(this, partial);
        this.addresses = this.addresses || [];
        this.orders = this.orders || [];
        this.favorites = this.favorites || [];
        this.cart = this.cart || [];
        this.preferences = this.preferences || {
            language: 'en',
            categories: [],
            notifications: true,
        };
        this.joinedAt = this.joinedAt || new Date();
        this.updatedAt = new Date();
    }
    return BuyerEntity;
}());
exports.BuyerEntity = BuyerEntity;
