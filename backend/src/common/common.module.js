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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
var common_1 = require("@nestjs/common");
var axios_1 = require("@nestjs/axios");
var firestore_service_1 = require("./services/firestore.service");
var storage_service_1 = require("./services/storage.service");
var vertex_ai_service_1 = require("./services/vertex-ai.service");
var vision_service_1 = require("./services/vision.service");
var speech_service_1 = require("./services/speech.service");
var remove_bg_service_1 = require("./services/remove-bg.service");
var canva_service_1 = require("./services/canva.service");
var razorpay_service_1 = require("./services/razorpay.service");
var CommonModule = function () {
    var _classDecorators = [(0, common_1.Global)(), (0, common_1.Module)({
            imports: [axios_1.HttpModule],
            providers: [
                firestore_service_1.FirestoreService,
                storage_service_1.StorageService,
                vertex_ai_service_1.VertexAiService,
                vision_service_1.VisionService,
                speech_service_1.SpeechService,
                remove_bg_service_1.RemoveBgService,
                canva_service_1.CanvaService,
                razorpay_service_1.RazorpayService,
            ],
            exports: [
                firestore_service_1.FirestoreService,
                storage_service_1.StorageService,
                vertex_ai_service_1.VertexAiService,
                vision_service_1.VisionService,
                speech_service_1.SpeechService,
                remove_bg_service_1.RemoveBgService,
                canva_service_1.CanvaService,
                razorpay_service_1.RazorpayService,
            ],
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var CommonModule = _classThis = /** @class */ (function () {
        function CommonModule_1() {
        }
        return CommonModule_1;
    }());
    __setFunctionName(_classThis, "CommonModule");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CommonModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CommonModule = _classThis;
}();
exports.CommonModule = CommonModule;
