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
exports.CheckoutResponse = exports.ProductDetailResponse = exports.ProductListResponse = void 0;
var swagger_1 = require("@nestjs/swagger");
var ProductListResponse = function () {
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
    var _imageUrl_decorators;
    var _imageUrl_initializers = [];
    var _imageUrl_extraInitializers = [];
    var _sellerName_decorators;
    var _sellerName_initializers = [];
    var _sellerName_extraInitializers = [];
    var _category_decorators;
    var _category_initializers = [];
    var _category_extraInitializers = [];
    var _tags_decorators;
    var _tags_initializers = [];
    var _tags_extraInitializers = [];
    var _rating_decorators;
    var _rating_initializers = [];
    var _rating_extraInitializers = [];
    var _location_decorators;
    var _location_initializers = [];
    var _location_extraInitializers = [];
    return _a = /** @class */ (function () {
            function ProductListResponse() {
                this.productId = __runInitializers(this, _productId_initializers, void 0);
                this.title = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _title_initializers, void 0));
                this.price = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _price_initializers, void 0));
                this.imageUrl = (__runInitializers(this, _price_extraInitializers), __runInitializers(this, _imageUrl_initializers, void 0));
                this.sellerName = (__runInitializers(this, _imageUrl_extraInitializers), __runInitializers(this, _sellerName_initializers, void 0));
                this.category = (__runInitializers(this, _sellerName_extraInitializers), __runInitializers(this, _category_initializers, void 0));
                this.tags = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _tags_initializers, void 0));
                this.rating = (__runInitializers(this, _tags_extraInitializers), __runInitializers(this, _rating_initializers, void 0));
                this.location = (__runInitializers(this, _rating_extraInitializers), __runInitializers(this, _location_initializers, void 0));
                __runInitializers(this, _location_extraInitializers);
            }
            return ProductListResponse;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productId_decorators = [(0, swagger_1.ApiProperty)()];
            _title_decorators = [(0, swagger_1.ApiProperty)()];
            _price_decorators = [(0, swagger_1.ApiProperty)()];
            _imageUrl_decorators = [(0, swagger_1.ApiProperty)()];
            _sellerName_decorators = [(0, swagger_1.ApiProperty)()];
            _category_decorators = [(0, swagger_1.ApiProperty)()];
            _tags_decorators = [(0, swagger_1.ApiProperty)()];
            _rating_decorators = [(0, swagger_1.ApiProperty)()];
            _location_decorators = [(0, swagger_1.ApiProperty)()];
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: function (obj) { return "productId" in obj; }, get: function (obj) { return obj.productId; }, set: function (obj, value) { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: function (obj) { return "price" in obj; }, get: function (obj) { return obj.price; }, set: function (obj, value) { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
            __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: function (obj) { return "imageUrl" in obj; }, get: function (obj) { return obj.imageUrl; }, set: function (obj, value) { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _imageUrl_extraInitializers);
            __esDecorate(null, null, _sellerName_decorators, { kind: "field", name: "sellerName", static: false, private: false, access: { has: function (obj) { return "sellerName" in obj; }, get: function (obj) { return obj.sellerName; }, set: function (obj, value) { obj.sellerName = value; } }, metadata: _metadata }, _sellerName_initializers, _sellerName_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: function (obj) { return "category" in obj; }, get: function (obj) { return obj.category; }, set: function (obj, value) { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _tags_decorators, { kind: "field", name: "tags", static: false, private: false, access: { has: function (obj) { return "tags" in obj; }, get: function (obj) { return obj.tags; }, set: function (obj, value) { obj.tags = value; } }, metadata: _metadata }, _tags_initializers, _tags_extraInitializers);
            __esDecorate(null, null, _rating_decorators, { kind: "field", name: "rating", static: false, private: false, access: { has: function (obj) { return "rating" in obj; }, get: function (obj) { return obj.rating; }, set: function (obj, value) { obj.rating = value; } }, metadata: _metadata }, _rating_initializers, _rating_extraInitializers);
            __esDecorate(null, null, _location_decorators, { kind: "field", name: "location", static: false, private: false, access: { has: function (obj) { return "location" in obj; }, get: function (obj) { return obj.location; }, set: function (obj, value) { obj.location = value; } }, metadata: _metadata }, _location_initializers, _location_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.ProductListResponse = ProductListResponse;
var ProductDetailResponse = function () {
    var _a;
    var _productId_decorators;
    var _productId_initializers = [];
    var _productId_extraInitializers = [];
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _story_decorators;
    var _story_initializers = [];
    var _story_extraInitializers = [];
    var _images_decorators;
    var _images_initializers = [];
    var _images_extraInitializers = [];
    var _audioUrls_decorators;
    var _audioUrls_initializers = [];
    var _audioUrls_extraInitializers = [];
    var _price_decorators;
    var _price_initializers = [];
    var _price_extraInitializers = [];
    var _tags_decorators;
    var _tags_initializers = [];
    var _tags_extraInitializers = [];
    var _category_decorators;
    var _category_initializers = [];
    var _category_extraInitializers = [];
    var _sellerInfo_decorators;
    var _sellerInfo_initializers = [];
    var _sellerInfo_extraInitializers = [];
    var _specifications_decorators;
    var _specifications_initializers = [];
    var _specifications_extraInitializers = [];
    var _shippingInfo_decorators;
    var _shippingInfo_initializers = [];
    var _shippingInfo_extraInitializers = [];
    return _a = /** @class */ (function () {
            function ProductDetailResponse() {
                this.productId = __runInitializers(this, _productId_initializers, void 0);
                this.title = (__runInitializers(this, _productId_extraInitializers), __runInitializers(this, _title_initializers, void 0));
                this.description = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.story = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _story_initializers, void 0));
                this.images = (__runInitializers(this, _story_extraInitializers), __runInitializers(this, _images_initializers, void 0));
                this.audioUrls = (__runInitializers(this, _images_extraInitializers), __runInitializers(this, _audioUrls_initializers, void 0));
                this.price = (__runInitializers(this, _audioUrls_extraInitializers), __runInitializers(this, _price_initializers, void 0));
                this.tags = (__runInitializers(this, _price_extraInitializers), __runInitializers(this, _tags_initializers, void 0));
                this.category = (__runInitializers(this, _tags_extraInitializers), __runInitializers(this, _category_initializers, void 0));
                this.sellerInfo = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _sellerInfo_initializers, void 0));
                this.specifications = (__runInitializers(this, _sellerInfo_extraInitializers), __runInitializers(this, _specifications_initializers, void 0));
                this.shippingInfo = (__runInitializers(this, _specifications_extraInitializers), __runInitializers(this, _shippingInfo_initializers, void 0));
                __runInitializers(this, _shippingInfo_extraInitializers);
            }
            return ProductDetailResponse;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _productId_decorators = [(0, swagger_1.ApiProperty)()];
            _title_decorators = [(0, swagger_1.ApiProperty)()];
            _description_decorators = [(0, swagger_1.ApiProperty)()];
            _story_decorators = [(0, swagger_1.ApiProperty)()];
            _images_decorators = [(0, swagger_1.ApiProperty)()];
            _audioUrls_decorators = [(0, swagger_1.ApiProperty)()];
            _price_decorators = [(0, swagger_1.ApiProperty)()];
            _tags_decorators = [(0, swagger_1.ApiProperty)()];
            _category_decorators = [(0, swagger_1.ApiProperty)()];
            _sellerInfo_decorators = [(0, swagger_1.ApiProperty)()];
            _specifications_decorators = [(0, swagger_1.ApiProperty)()];
            _shippingInfo_decorators = [(0, swagger_1.ApiProperty)()];
            __esDecorate(null, null, _productId_decorators, { kind: "field", name: "productId", static: false, private: false, access: { has: function (obj) { return "productId" in obj; }, get: function (obj) { return obj.productId; }, set: function (obj, value) { obj.productId = value; } }, metadata: _metadata }, _productId_initializers, _productId_extraInitializers);
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _story_decorators, { kind: "field", name: "story", static: false, private: false, access: { has: function (obj) { return "story" in obj; }, get: function (obj) { return obj.story; }, set: function (obj, value) { obj.story = value; } }, metadata: _metadata }, _story_initializers, _story_extraInitializers);
            __esDecorate(null, null, _images_decorators, { kind: "field", name: "images", static: false, private: false, access: { has: function (obj) { return "images" in obj; }, get: function (obj) { return obj.images; }, set: function (obj, value) { obj.images = value; } }, metadata: _metadata }, _images_initializers, _images_extraInitializers);
            __esDecorate(null, null, _audioUrls_decorators, { kind: "field", name: "audioUrls", static: false, private: false, access: { has: function (obj) { return "audioUrls" in obj; }, get: function (obj) { return obj.audioUrls; }, set: function (obj, value) { obj.audioUrls = value; } }, metadata: _metadata }, _audioUrls_initializers, _audioUrls_extraInitializers);
            __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: function (obj) { return "price" in obj; }, get: function (obj) { return obj.price; }, set: function (obj, value) { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
            __esDecorate(null, null, _tags_decorators, { kind: "field", name: "tags", static: false, private: false, access: { has: function (obj) { return "tags" in obj; }, get: function (obj) { return obj.tags; }, set: function (obj, value) { obj.tags = value; } }, metadata: _metadata }, _tags_initializers, _tags_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: function (obj) { return "category" in obj; }, get: function (obj) { return obj.category; }, set: function (obj, value) { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _sellerInfo_decorators, { kind: "field", name: "sellerInfo", static: false, private: false, access: { has: function (obj) { return "sellerInfo" in obj; }, get: function (obj) { return obj.sellerInfo; }, set: function (obj, value) { obj.sellerInfo = value; } }, metadata: _metadata }, _sellerInfo_initializers, _sellerInfo_extraInitializers);
            __esDecorate(null, null, _specifications_decorators, { kind: "field", name: "specifications", static: false, private: false, access: { has: function (obj) { return "specifications" in obj; }, get: function (obj) { return obj.specifications; }, set: function (obj, value) { obj.specifications = value; } }, metadata: _metadata }, _specifications_initializers, _specifications_extraInitializers);
            __esDecorate(null, null, _shippingInfo_decorators, { kind: "field", name: "shippingInfo", static: false, private: false, access: { has: function (obj) { return "shippingInfo" in obj; }, get: function (obj) { return obj.shippingInfo; }, set: function (obj, value) { obj.shippingInfo = value; } }, metadata: _metadata }, _shippingInfo_initializers, _shippingInfo_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.ProductDetailResponse = ProductDetailResponse;
var CheckoutResponse = function () {
    var _a;
    var _orderId_decorators;
    var _orderId_initializers = [];
    var _orderId_extraInitializers = [];
    var _razorpayOrderId_decorators;
    var _razorpayOrderId_initializers = [];
    var _razorpayOrderId_extraInitializers = [];
    var _amount_decorators;
    var _amount_initializers = [];
    var _amount_extraInitializers = [];
    var _currency_decorators;
    var _currency_initializers = [];
    var _currency_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _message_decorators;
    var _message_initializers = [];
    var _message_extraInitializers = [];
    var _paymentUrl_decorators;
    var _paymentUrl_initializers = [];
    var _paymentUrl_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CheckoutResponse() {
                this.orderId = __runInitializers(this, _orderId_initializers, void 0);
                this.razorpayOrderId = (__runInitializers(this, _orderId_extraInitializers), __runInitializers(this, _razorpayOrderId_initializers, void 0));
                this.amount = (__runInitializers(this, _razorpayOrderId_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
                this.currency = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _currency_initializers, void 0));
                this.status = (__runInitializers(this, _currency_extraInitializers), __runInitializers(this, _status_initializers, void 0));
                this.message = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _message_initializers, void 0));
                this.paymentUrl = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _paymentUrl_initializers, void 0));
                __runInitializers(this, _paymentUrl_extraInitializers);
            }
            return CheckoutResponse;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _orderId_decorators = [(0, swagger_1.ApiProperty)()];
            _razorpayOrderId_decorators = [(0, swagger_1.ApiProperty)()];
            _amount_decorators = [(0, swagger_1.ApiProperty)()];
            _currency_decorators = [(0, swagger_1.ApiProperty)()];
            _status_decorators = [(0, swagger_1.ApiProperty)()];
            _message_decorators = [(0, swagger_1.ApiProperty)()];
            _paymentUrl_decorators = [(0, swagger_1.ApiProperty)()];
            __esDecorate(null, null, _orderId_decorators, { kind: "field", name: "orderId", static: false, private: false, access: { has: function (obj) { return "orderId" in obj; }, get: function (obj) { return obj.orderId; }, set: function (obj, value) { obj.orderId = value; } }, metadata: _metadata }, _orderId_initializers, _orderId_extraInitializers);
            __esDecorate(null, null, _razorpayOrderId_decorators, { kind: "field", name: "razorpayOrderId", static: false, private: false, access: { has: function (obj) { return "razorpayOrderId" in obj; }, get: function (obj) { return obj.razorpayOrderId; }, set: function (obj, value) { obj.razorpayOrderId = value; } }, metadata: _metadata }, _razorpayOrderId_initializers, _razorpayOrderId_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: function (obj) { return "amount" in obj; }, get: function (obj) { return obj.amount; }, set: function (obj, value) { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _currency_decorators, { kind: "field", name: "currency", static: false, private: false, access: { has: function (obj) { return "currency" in obj; }, get: function (obj) { return obj.currency; }, set: function (obj, value) { obj.currency = value; } }, metadata: _metadata }, _currency_initializers, _currency_extraInitializers);
            __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: function (obj) { return "message" in obj; }, get: function (obj) { return obj.message; }, set: function (obj, value) { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
            __esDecorate(null, null, _paymentUrl_decorators, { kind: "field", name: "paymentUrl", static: false, private: false, access: { has: function (obj) { return "paymentUrl" in obj; }, get: function (obj) { return obj.paymentUrl; }, set: function (obj, value) { obj.paymentUrl = value; } }, metadata: _metadata }, _paymentUrl_initializers, _paymentUrl_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CheckoutResponse = CheckoutResponse;
