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
exports.ProductQueryDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var ProductQueryDto = function () {
    var _a;
    var _category_decorators;
    var _category_initializers = [];
    var _category_extraInitializers = [];
    var _language_decorators;
    var _language_initializers = [];
    var _language_extraInitializers = [];
    var _minPrice_decorators;
    var _minPrice_initializers = [];
    var _minPrice_extraInitializers = [];
    var _maxPrice_decorators;
    var _maxPrice_initializers = [];
    var _maxPrice_extraInitializers = [];
    var _sortBy_decorators;
    var _sortBy_initializers = [];
    var _sortBy_extraInitializers = [];
    var _search_decorators;
    var _search_initializers = [];
    var _search_extraInitializers = [];
    return _a = /** @class */ (function () {
            function ProductQueryDto() {
                this.category = __runInitializers(this, _category_initializers, void 0);
                this.language = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _language_initializers, void 0));
                this.minPrice = (__runInitializers(this, _language_extraInitializers), __runInitializers(this, _minPrice_initializers, void 0));
                this.maxPrice = (__runInitializers(this, _minPrice_extraInitializers), __runInitializers(this, _maxPrice_initializers, void 0));
                this.sortBy = (__runInitializers(this, _maxPrice_extraInitializers), __runInitializers(this, _sortBy_initializers, void 0));
                this.search = (__runInitializers(this, _sortBy_extraInitializers), __runInitializers(this, _search_initializers, void 0));
                __runInitializers(this, _search_extraInitializers);
            }
            return ProductQueryDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _category_decorators = [(0, swagger_1.ApiProperty)({ required: false }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _language_decorators = [(0, swagger_1.ApiProperty)({ required: false, enum: ['en', 'hi', 'kn'] }), (0, class_validator_1.IsEnum)(['en', 'hi', 'kn']), (0, class_validator_1.IsOptional)()];
            _minPrice_decorators = [(0, swagger_1.ApiProperty)({ required: false }), (0, class_validator_1.IsNumber)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_validator_1.IsOptional)()];
            _maxPrice_decorators = [(0, swagger_1.ApiProperty)({ required: false }), (0, class_validator_1.IsNumber)(), (0, class_transformer_1.Type)(function () { return Number; }), (0, class_validator_1.IsOptional)()];
            _sortBy_decorators = [(0, swagger_1.ApiProperty)({ required: false, enum: ['price', 'date', 'popularity'] }), (0, class_validator_1.IsEnum)(['price', 'date', 'popularity']), (0, class_validator_1.IsOptional)()];
            _search_decorators = [(0, swagger_1.ApiProperty)({ required: false }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: function (obj) { return "category" in obj; }, get: function (obj) { return obj.category; }, set: function (obj, value) { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _language_decorators, { kind: "field", name: "language", static: false, private: false, access: { has: function (obj) { return "language" in obj; }, get: function (obj) { return obj.language; }, set: function (obj, value) { obj.language = value; } }, metadata: _metadata }, _language_initializers, _language_extraInitializers);
            __esDecorate(null, null, _minPrice_decorators, { kind: "field", name: "minPrice", static: false, private: false, access: { has: function (obj) { return "minPrice" in obj; }, get: function (obj) { return obj.minPrice; }, set: function (obj, value) { obj.minPrice = value; } }, metadata: _metadata }, _minPrice_initializers, _minPrice_extraInitializers);
            __esDecorate(null, null, _maxPrice_decorators, { kind: "field", name: "maxPrice", static: false, private: false, access: { has: function (obj) { return "maxPrice" in obj; }, get: function (obj) { return obj.maxPrice; }, set: function (obj, value) { obj.maxPrice = value; } }, metadata: _metadata }, _maxPrice_initializers, _maxPrice_extraInitializers);
            __esDecorate(null, null, _sortBy_decorators, { kind: "field", name: "sortBy", static: false, private: false, access: { has: function (obj) { return "sortBy" in obj; }, get: function (obj) { return obj.sortBy; }, set: function (obj, value) { obj.sortBy = value; } }, metadata: _metadata }, _sortBy_initializers, _sortBy_extraInitializers);
            __esDecorate(null, null, _search_decorators, { kind: "field", name: "search", static: false, private: false, access: { has: function (obj) { return "search" in obj; }, get: function (obj) { return obj.search; }, set: function (obj, value) { obj.search = value; } }, metadata: _metadata }, _search_initializers, _search_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.ProductQueryDto = ProductQueryDto;
