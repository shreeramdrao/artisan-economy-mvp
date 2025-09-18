"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerOrdersResponse = exports.SellerProductsResponse = exports.ProductUploadResponse = void 0;
var swagger_1 = require("@nestjs/swagger");
var ProductUploadResponse = function () {
    var _a;
    var _productId_decorators;
    var _productId_initializers = [];
    var _productId_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _message_decorators;
    var _message_initializers = [];
    var _message_extraInitializers = [];
    var _productUrl_decorators;
    var _productUrl_initializers = [];
    var _productUrl_extraInitializers = [];
    return _a = /** @class */ (function () {
            function ProductUploadResponse() {
                this.productId = __runInitializers(this, _productId_initializers, void 0);
                this.status = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                this.message = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _message_initializers, void 0));
                this.productUrl = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _productUrl_initializers, void 0));
                __runInitializers(this, _productUrl_extraInitializers);
            }
            return ProductUploadResponse;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productId_decorators = [(0, swagger_1.ApiProperty)()];
            _status_decorators = [(0, swagger_1.ApiProperty)()];
            _message_decorators = [(0, swagger_1.ApiProperty)()];
            _productUrl_decorators = [(0, swagger_1.ApiProperty)()];
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: function (obj) { return "productId" in obj; }, get: function (obj) { return obj.productId; }, set: function (obj, value) { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: function (obj) { return "message" in obj; }, get: function (obj) { return obj.message; }, set: function (obj, value) { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            __esDecorate(null, null, _productUrl_decorators, { kind: "field", name: "productUrl", static: false, private: false, access: { has: function (obj) { return "productUrl" in obj; }, get: function (obj) { return obj.productUrl; }, set: function (obj, value) { obj.productUrl = value; } }, metadata: _metadata }, _productUrl_initializers, _productUrl_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.ProductUploadResponse = ProductUploadResponse;
var SellerProductsResponse = function () {
    var _a;
    var _productId_decorators;
    var _productId_initializers = [];
    var _productId_extraInitializers = [];
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _price_decorators;
    var _price_initializers = [];
    var _price_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _imageUrl_decorators;
    var _imageUrl_initializers = [];
    var _imageUrl_extraInitializers = [];
    var _category_decorators;
    var _category_initializers = [];
    var _category_extraInitializers = [];
    var _views_decorators;
    var _views_initializers = [];
    var _views_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    return _a = /** @class */ (function () {
            function SellerProductsResponse() {
                this.productId = __runInitializers(this, _productId_initializers, void 0);
                this.title = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _title_initializers, void 0));
                this.price = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _price_initializers, void 0));
                this.status = (__runInitializers(this, _price_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                this.imageUrl = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _imageUrl_initializers, void 0));
                this.category = (__runInitializers(this, _imageUrl_extraInitializers), __runInitializers(this, _category_initializers, void 0));
                this.views = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _views_initializers, void 0));
                this.createdAt = (__runInitializers(this, _views_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
                __runInitializers(this, _createdAt_extraInitializers);
            }
            return SellerProductsResponse;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productId_decorators = [(0, swagger_1.ApiProperty)()];
            _title_decorators = [(0, swagger_1.ApiProperty)()];
            _price_decorators = [(0, swagger_1.ApiProperty)()];
            _status_decorators = [(0, swagger_1.ApiProperty)()];
            _imageUrl_decorators = [(0, swagger_1.ApiProperty)()];
            _category_decorators = [(0, swagger_1.ApiProperty)()];
            _views_decorators = [(0, swagger_1.ApiProperty)()];
            _createdAt_decorators = [(0, swagger_1.ApiProperty)()];
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: function (obj) { return "productId" in obj; }, get: function (obj) { return obj.productId; }, set: function (obj, value) { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: function (obj) { return "price" in obj; }, get: function (obj) { return obj.price; }, set: function (obj, value) { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: function (obj) { return "imageUrl" in obj; }, get: function (obj) { return obj.imageUrl; }, set: function (obj, value) { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _imageUrl_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: function (obj) { return "category" in obj; }, get: function (obj) { return obj.category; }, set: function (obj, value) { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _views_decorators, { kind: "field", name: "views", static: false, private: false, access: { has: function (obj) { return "views" in obj; }, get: function (obj) { return obj.views; }, set: function (obj, value) { obj.views = value; } }, metadata: _metadata }, _views_initializers, _views_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.SellerProductsResponse = SellerProductsResponse;
var SellerOrdersResponse = function () {
    var _a;
    var _orderId_decorators;
    var _orderId_initializers = [];
    var _orderId_extraInitializers = [];
    var _productId_decorators;
    var _productId_initializers = [];
    var _productId_extraInitializers = [];
    var _productTitle_decorators;
    var _productTitle_initializers = [];
    var _productTitle_extraInitializers = [];
    var _buyerName_decorators;
    var _buyerName_initializers = [];
    var _buyerName_extraInitializers = [];
    var _amount_decorators;
    var _amount_initializers = [];
    var _amount_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _paymentStatus_decorators;
    var _paymentStatus_initializers = [];
    var _paymentStatus_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    return _a = /** @class */ (function () {
            function SellerOrdersResponse() {
                this.orderId = __runInitializers(this, _orderId_initializers, void 0);
                this.productId = (__runInitializers(this, _orderId_extraInitializers), __runInitializers(this, _productId_initializers, void 0));
                this.productTitle = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _productTitle_initializers, void 0));
                this.buyerName = (__runInitializers(this, _productTitle_extraInitializers), __runInitializers(this, _buyerName_initializers, void 0));
                this.amount = (__runInitializers(this, _buyerName_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
                this.status = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                this.paymentStatus = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _paymentStatus_initializers, void 0));
                this.createdAt = (__runInitializers(this, _paymentStatus_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
                __runInitializers(this, _createdAt_extraInitializers);
            }
            return SellerOrdersResponse;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _orderId_decorators = [(0, swagger_1.ApiProperty)()];
            _productId_decorators = [(0, swagger_1.ApiProperty)()];
            _productTitle_decorators = [(0, swagger_1.ApiProperty)()];
            _buyerName_decorators = [(0, swagger_1.ApiProperty)()];
            _amount_decorators = [(0, swagger_1.ApiProperty)()];
            _status_decorators = [(0, swagger_1.ApiProperty)()];
            _paymentStatus_decorators = [(0, swagger_1.ApiProperty)()];
            _createdAt_decorators = [(0, swagger_1.ApiProperty)()];
            __esDecorate(null, null, _orderId_decorators, { kind: "field", name: "orderId", static: false, private: false, access: { has: function (obj) { return "orderId" in obj; }, get: function (obj) { return obj.orderId; }, set: function (obj, value) { obj.orderId = value; } }, metadata: _metadata }, _orderId_initializers, _orderId_extraInitializers);
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: function (obj) { return "productId" in obj; }, get: function (obj) { return obj.productId; }, set: function (obj, value) { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _productTitle_decorators, { kind: "field", name: "productTitle", static: false, private: false, access: { has: function (obj) { return "productTitle" in obj; }, get: function (obj) { return obj.productTitle; }, set: function (obj, value) { obj.productTitle = value; } }, metadata: _metadata }, _productTitle_initializers, _productTitle_extraInitializers);
            __esDecorate(null, null, _buyerName_decorators, { kind: "field", name: "buyerName", static: false, private: false, access: { has: function (obj) { return "buyerName" in obj; }, get: function (obj) { return obj.buyerName; }, set: function (obj, value) { obj.buyerName = value; } }, metadata: _metadata }, _buyerName_initializers, _buyerName_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: function (obj) { return "amount" in obj; }, get: function (obj) { return obj.amount; }, set: function (obj, value) { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _paymentStatus_decorators, { kind: "field", name: "paymentStatus", static: false, private: false, access: { has: function (obj) { return "paymentStatus" in obj; }, get: function (obj) { return obj.paymentStatus; }, set: function (obj, value) { obj.paymentStatus = value; } }, metadata: _metadata }, _paymentStatus_initializers, _paymentStatus_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.SellerOrdersResponse = SellerOrdersResponse;
