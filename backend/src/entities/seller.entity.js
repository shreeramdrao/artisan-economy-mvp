"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerEntity = void 0;
var SellerEntity = /** @class */ (function () {
    function SellerEntity(partial) {
        Object.assign(this, partial);
        this.products = this.products || [];
        this.totalSales = this.totalSales || 0;
        this.totalRevenue = this.totalRevenue || 0;
        this.rating = this.rating || 0;
        this.reviewCount = this.reviewCount || 0;
        this.isVerified = this.isVerified || false;
        this.joinedAt = this.joinedAt || new Date();
        this.updatedAt = new Date();
    }
    return SellerEntity;
}());
exports.SellerEntity = SellerEntity;
