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
exports.VertexAiService = void 0;
var common_1 = require("@nestjs/common");
var vertexai_1 = require("@google-cloud/vertexai");
var VertexAiService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var VertexAiService = _classThis = /** @class */ (function () {
        function VertexAiService_1(configService) {
            this.configService = configService;
            this.logger = new common_1.Logger(VertexAiService.name);
            var projectId = this.configService.get('googleCloud.projectId');
            var location = this.configService.get('ai.vertexLocation');
            var modelName = this.configService.get('ai.vertexModel');
            this.vertexAI = new vertexai_1.VertexAI({
                project: projectId,
                location: location,
            });
            this.model = this.vertexAI.preview.getGenerativeModel({
                model: modelName,
            });
            this.logger.log('Vertex AI initialized');
        }
        VertexAiService_1.prototype.polishStory = function (rawStory) {
            return __awaiter(this, void 0, void 0, function () {
                var prompt_1, result, response, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            prompt_1 = "Polish the following artisan's story into a professional 40-60 word product description.\n      Keep warmth and authenticity. Then translate to Hindi and Kannada.\n      \n      Original story: ".concat(rawStory, "\n      \n      Format the response as JSON:\n      {\n        \"polishedStory\": \"...\",\n        \"translations\": {\n          \"en\": \"...\",\n          \"hi\": \"...\",\n          \"kn\": \"...\"\n        }\n      }");
                            return [4 /*yield*/, this.model.generateContent(prompt_1)];
                        case 1:
                            result = _a.sent();
                            response = result.response.text();
                            try {
                                return [2 /*return*/, JSON.parse(response)];
                            }
                            catch (_b) {
                                // Fallback if JSON parsing fails
                                return [2 /*return*/, {
                                        polishedStory: rawStory,
                                        translations: {
                                            en: rawStory,
                                            hi: rawStory,
                                            kn: rawStory,
                                        },
                                    }];
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            this.logger.error('Error polishing story:', error_1);
                            throw error_1;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        VertexAiService_1.prototype.suggestPrice = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var prompt_2, result, response, baseCost, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            prompt_2 = "Suggest 3 price points for this handmade product:\n      Category: ".concat(data.category, "\n      Description: ").concat(data.description, "\n      Material Cost: \u20B9").concat(data.materialCost, "\n      Hours: ").concat(data.hours, "\n      ").concat(data.rarity ? "Rarity: ".concat(data.rarity, "/10") : '', "\n      \n      Provide Conservative, Recommended, and Premium prices in INR with reasoning.\n      Format as JSON: { \"conservative\": number, \"recommended\": number, \"premium\": number, \"reasoning\": \"...\" }");
                            return [4 /*yield*/, this.model.generateContent(prompt_2)];
                        case 1:
                            result = _a.sent();
                            response = result.response.text();
                            try {
                                return [2 /*return*/, JSON.parse(response)];
                            }
                            catch (_b) {
                                baseCost = data.materialCost + (data.hours * 500);
                                return [2 /*return*/, {
                                        conservative: Math.round(baseCost * 1.5),
                                        recommended: Math.round(baseCost * 2),
                                        premium: Math.round(baseCost * 2.5),
                                        reasoning: 'Based on material cost and labor hours',
                                    }];
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _a.sent();
                            this.logger.error('Error suggesting price:', error_2);
                            throw error_2;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        VertexAiService_1.prototype.generateContent = function (prompt) {
            return __awaiter(this, void 0, void 0, function () {
                var result, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.model.generateContent(prompt)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result.response.text()];
                        case 2:
                            error_3 = _a.sent();
                            this.logger.error('Error generating content:', error_3);
                            throw error_3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return VertexAiService_1;
    }());
    __setFunctionName(_classThis, "VertexAiService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        VertexAiService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return VertexAiService = _classThis;
}();
exports.VertexAiService = VertexAiService;
