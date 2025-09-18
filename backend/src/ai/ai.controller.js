"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var AiController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('ai'), (0, common_1.Controller)('ai')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _polishStory_decorators;
    var _suggestPrice_decorators;
    var _enhanceImage_decorators;
    var _transcribeAudio_decorators;
    var _textToSpeech_decorators;
    var _generateInstagramCaption_decorators;
    var AiController = _classThis = /** @class */ (function () {
        function AiController_1(aiService) {
            this.aiService = (__runInitializers(this, _instanceExtraInitializers), aiService);
        }
        AiController_1.prototype.polishStory = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.aiService.polishStory(dto.rawStory)];
                });
            });
        };
        AiController_1.prototype.suggestPrice = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.aiService.suggestPrice(dto)];
                });
            });
        };
        AiController_1.prototype.enhanceImage = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.aiService.enhanceImage(dto.imageUrl)];
                });
            });
        };
        AiController_1.prototype.transcribeAudio = function (audioData) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.aiService.transcribeAudio(audioData)];
                });
            });
        };
        AiController_1.prototype.textToSpeech = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.aiService.textToSpeech(data.text, data.language)];
                });
            });
        };
        AiController_1.prototype.generateInstagramCaption = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.aiService.generateInstagramCaption(data.story, data.title)];
                });
            });
        };
        return AiController_1;
    }());
    __setFunctionName(_classThis, "AiController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _polishStory_decorators = [(0, common_1.Post)('story-polish'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Polish and translate product story' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Polished story with translations',
            })];
        _suggestPrice_decorators = [(0, common_1.Post)('price-suggest'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Get AI-powered price suggestions' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Price suggestions',
            })];
        _enhanceImage_decorators = [(0, common_1.Post)('image-enhance'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Enhance product image' }), (0, swagger_1.ApiResponse)({
                status: 200,
                description: 'Enhanced image URL',
            })];
        _transcribeAudio_decorators = [(0, common_1.Post)('transcribe'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Transcribe audio to text' })];
        _textToSpeech_decorators = [(0, common_1.Post)('text-to-speech'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Convert text to speech' })];
        _generateInstagramCaption_decorators = [(0, common_1.Post)('generate-instagram-caption'), (0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, swagger_1.ApiOperation)({ summary: 'Generate Instagram caption for product' })];
        __esDecorate(_classThis, null, _polishStory_decorators, { kind: "method", name: "polishStory", static: false, private: false, access: { has: function (obj) { return "polishStory" in obj; }, get: function (obj) { return obj.polishStory; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _suggestPrice_decorators, { kind: "method", name: "suggestPrice", static: false, private: false, access: { has: function (obj) { return "suggestPrice" in obj; }, get: function (obj) { return obj.suggestPrice; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _enhanceImage_decorators, { kind: "method", name: "enhanceImage", static: false, private: false, access: { has: function (obj) { return "enhanceImage" in obj; }, get: function (obj) { return obj.enhanceImage; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _transcribeAudio_decorators, { kind: "method", name: "transcribeAudio", static: false, private: false, access: { has: function (obj) { return "transcribeAudio" in obj; }, get: function (obj) { return obj.transcribeAudio; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _textToSpeech_decorators, { kind: "method", name: "textToSpeech", static: false, private: false, access: { has: function (obj) { return "textToSpeech" in obj; }, get: function (obj) { return obj.textToSpeech; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _generateInstagramCaption_decorators, { kind: "method", name: "generateInstagramCaption", static: false, private: false, access: { has: function (obj) { return "generateInstagramCaption" in obj; }, get: function (obj) { return obj.generateInstagramCaption; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AiController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AiController = _classThis;
}();
exports.AiController = AiController;
