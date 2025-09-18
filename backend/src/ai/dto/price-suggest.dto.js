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
exports.PriceSuggestDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var PriceSuggestDto = function () {
    var _a;
    var _category_decorators;
    var _category_initializers = [];
    var _category_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _materialCost_decorators;
    var _materialCost_initializers = [];
    var _materialCost_extraInitializers = [];
    var _hours_decorators;
    var _hours_initializers = [];
    var _hours_extraInitializers = [];
    var _rarity_decorators;
    var _rarity_initializers = [];
    var _rarity_extraInitializers = [];
    return _a = /** @class */ (function () {
            function PriceSuggestDto() {
                this.category = __runInitializers(this, _category_initializers, void 0);
                this.description = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.materialCost = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _materialCost_initializers, void 0));
                this.hours = (__runInitializers(this, _materialCost_extraInitializers), __runInitializers(this, _hours_initializers, void 0));
                this.rarity = (__runInitializers(this, _hours_extraInitializers), __runInitializers(this, _rarity_initializers, void 0));
                __runInitializers(this, _rarity_extraInitializers);
            }
            return PriceSuggestDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _category_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Product category',
                    example: 'Textiles',
                }), (0, class_validator_1.IsString)()];
            _description_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Product description',
                    required: false,
                }), (0, class_validator_1.IsString)(), (0, class_validator_1.IsOptional)()];
            _materialCost_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Material cost in INR',
                    example: 1500,
                }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _hours_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Hours spent creating the product',
                    example: 8,
                }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(0)];
            _rarity_decorators = [(0, swagger_1.ApiProperty)({
                    description: 'Rarity level (1-10)',
                    example: 7,
                    required: false,
                }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: function (obj) { return "category" in obj; }, get: function (obj) { return obj.category; }, set: function (obj, value) { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _materialCost_decorators, { kind: "field", name: "materialCost", static: false, private: false, access: { has: function (obj) { return "materialCost" in obj; }, get: function (obj) { return obj.materialCost; }, set: function (obj, value) { obj.materialCost = value; } }, metadata: _metadata }, _materialCost_initializers, _materialCost_extraInitializers);
            __esDecorate(null, null, _hours_decorators, { kind: "field", name: "hours", static: false, private: false, access: { has: function (obj) { return "hours" in obj; }, get: function (obj) { return obj.hours; }, set: function (obj, value) { obj.hours = value; } }, metadata: _metadata }, _hours_initializers, _hours_extraInitializers);
            __esDecorate(null, null, _rarity_decorators, { kind: "field", name: "rarity", static: false, private: false, access: { has: function (obj) { return "rarity" in obj; }, get: function (obj) { return obj.rarity; }, set: function (obj, value) { obj.rarity = value; } }, metadata: _metadata }, _rarity_initializers, _rarity_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.PriceSuggestDto = PriceSuggestDto;
