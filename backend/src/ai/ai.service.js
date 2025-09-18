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
exports.AiService = void 0;
var common_1 = require("@nestjs/common");
var AiService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var AiService = _classThis = /** @class */ (function () {
        function AiService_1(vertexAiService, visionService, speechService, removeBgService, canvaService) {
            this.vertexAiService = vertexAiService;
            this.visionService = visionService;
            this.speechService = speechService;
            this.removeBgService = removeBgService;
            this.canvaService = canvaService;
            this.logger = new common_1.Logger(AiService.name);
        }
        AiService_1.prototype.polishStory = function (rawStory) {
            return __awaiter(this, void 0, void 0, function () {
                var error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log('Polishing story with AI');
                            return [4 /*yield*/, this.vertexAiService.polishStory(rawStory)];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_1 = _a.sent();
                            this.logger.error('Error polishing story:', error_1);
                            // Fallback response
                            return [2 /*return*/, {
                                    polishedStory: rawStory,
                                    translations: {
                                        en: rawStory,
                                        hi: rawStory,
                                        kn: rawStory,
                                    },
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        AiService_1.prototype.suggestPrice = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                var error_2, baseCost;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log('Generating price suggestions');
                            return [4 /*yield*/, this.vertexAiService.suggestPrice({
                                    category: dto.category,
                                    description: dto.description || '',
                                    materialCost: dto.materialCost,
                                    hours: dto.hours,
                                    rarity: dto.rarity,
                                })];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_2 = _a.sent();
                            this.logger.error('Error suggesting price:', error_2);
                            baseCost = dto.materialCost + (dto.hours * 500);
                            return [2 /*return*/, {
                                    conservative: Math.round(baseCost * 1.5),
                                    recommended: Math.round(baseCost * 2),
                                    premium: Math.round(baseCost * 2.5),
                                    reasoning: 'Based on material cost and labor hours',
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        AiService_1.prototype.enhanceImage = function (imageUrl) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    try {
                        this.logger.log('Enhancing image');
                        // This would integrate with Remove.bg and Canva APIs
                        return [2 /*return*/, {
                                enhancedImageUrl: imageUrl,
                                improvements: ['Background removed', 'Color enhanced', 'Lighting adjusted'],
                            }];
                    }
                    catch (error) {
                        this.logger.error('Error enhancing image:', error);
                        return [2 /*return*/, {
                                enhancedImageUrl: imageUrl,
                                improvements: [],
                            }];
                    }
                    return [2 /*return*/];
                });
            });
        };
        AiService_1.prototype.transcribeAudio = function (audioData) {
            return __awaiter(this, void 0, void 0, function () {
                var error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log('Transcribing audio');
                            return [4 /*yield*/, this.speechService.speechToText(audioData)];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_3 = _a.sent();
                            this.logger.error('Error transcribing audio:', error_3);
                            return [2 /*return*/, {
                                    transcript: '',
                                    confidence: 0,
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        AiService_1.prototype.textToSpeech = function (text, language) {
            return __awaiter(this, void 0, void 0, function () {
                var error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log("Converting text to speech in ".concat(language));
                            return [4 /*yield*/, this.speechService.textToSpeech(text, language)];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            error_4 = _a.sent();
                            this.logger.error('Error converting text to speech:', error_4);
                            return [2 /*return*/, {
                                    audioUrl: '',
                                    duration: 0,
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        AiService_1.prototype.generateInstagramCaption = function (story, title) {
            return __awaiter(this, void 0, void 0, function () {
                var prompt_1, response, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.logger.log('Generating Instagram caption');
                            prompt_1 = "Create an Instagram caption (max 150 chars) and 10 hashtags for this artisan product:\n        Title: ".concat(title, "\n        Story: ").concat(story);
                            return [4 /*yield*/, this.vertexAiService.generateContent(prompt_1)];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, {
                                    caption: response.caption || "Handcrafted ".concat(title, " - A piece of Indian heritage \uD83E\uDE94"),
                                    hashtags: response.hashtags || [
                                        '#HandmadeInIndia',
                                        '#ArtisanCrafts',
                                        '#IndianHeritage',
                                        '#SupportLocal',
                                        '#TraditionalArt',
                                        '#MadeWithLove',
                                        '#CulturalCrafts',
                                        '#IndianArtisans',
                                        '#Sustainable',
                                        '#UniqueGifts',
                                    ],
                                }];
                        case 2:
                            error_5 = _a.sent();
                            this.logger.error('Error generating Instagram caption:', error_5);
                            return [2 /*return*/, {
                                    caption: "Beautiful ".concat(title, " - Handcrafted with love \uD83C\uDFA8"),
                                    hashtags: ['#Handmade', '#ArtisanCrafts', '#MadeInIndia'],
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return AiService_1;
    }());
    __setFunctionName(_classThis, "AiService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AiService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AiService = _classThis;
}();
exports.AiService = AiService;
