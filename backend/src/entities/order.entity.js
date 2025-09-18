"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderEntity = void 0;
var OrderEntity = /** @class */ (function () {
    function OrderEntity(partial) {
        Object.assign(this, partial);
        this.quantity = this.quantity || 1;
        this.totalAmount = this.amount * this.quantity;
        this.paymentStatus = this.paymentStatus || 'pending';
        this.status = this.status || 'pending';
        this.createdAt = this.createdAt || new Date();
        this.updatedAt = new Date();
    }
    return OrderEntity;
}());
exports.OrderEntity = OrderEntity;
