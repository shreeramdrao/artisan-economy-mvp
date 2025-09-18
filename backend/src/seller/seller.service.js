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
exports.SellerService = void 0;
var common_1 = require("@nestjs/common");
var uuid_1 = require("uuid");
var product_entity_1 = require("../entities/product.entity");
var SellerService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var SellerService = _classThis = /** @class */ (function () {
        function SellerService_1(firestoreService, storageService, vertexAiService, visionService, removeBgService, canvaService) {
            this.firestoreService = firestoreService;
            this.storageService = storageService;
            this.vertexAiService = vertexAiService;
            this.visionService = visionService;
            this.removeBgService = removeBgService;
            this.canvaService = canvaService;
            this.logger = new common_1.Logger(SellerService.name);
        }
        SellerService_1.prototype.uploadProduct = function (image, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var productId, originalImagePath, originalImageUrl, visionAnalysis, removedBgBuffer, enhancedImagePath, enhancedImageUrl, polishedImageUrl, storyData, audioUrls, priceSuggestions, product, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 12, , 13]);
                            productId = (0, uuid_1.v4)();
                            this.logger.log("Processing product upload: ".concat(productId));
                            originalImagePath = "products/".concat(productId, "/original.jpg");
                            return [4 /*yield*/, this.storageService.uploadFile(image.buffer, originalImagePath, image.mimetype)];
                        case 1:
                            originalImageUrl = _a.sent();
                            return [4 /*yield*/, this.visionService.analyzeProductImage(image.buffer)];
                        case 2:
                            visionAnalysis = _a.sent();
                            return [4 /*yield*/, this.removeBgService.removeBackground(image.buffer)];
                        case 3:
                            removedBgBuffer = _a.sent();
                            enhancedImagePath = "products/".concat(productId, "/enhanced.jpg");
                            return [4 /*yield*/, this.storageService.uploadFile(removedBgBuffer, enhancedImagePath, 'image/jpeg')];
                        case 4:
                            enhancedImageUrl = _a.sent();
                            return [4 /*yield*/, this.canvaService.polishImage(enhancedImageUrl)];
                        case 5:
                            polishedImageUrl = _a.sent();
                            return [4 /*yield*/, this.vertexAiService.polishStory(dto.story)];
                        case 6:
                            storyData = _a.sent();
                            return [4 /*yield*/, this.generateAudioForAllLanguages(productId, storyData.translations)];
                        case 7:
                            audioUrls = _a.sent();
                            priceSuggestions = null;
                            if (!dto.requestPriceSuggestion) return [3 /*break*/, 9];
                            return [4 /*yield*/, this.vertexAiService.suggestPrice({
                                    category: dto.category,
                                    description: storyData.polishedStory,
                                    materialCost: dto.materialCost || 0,
                                    hours: dto.hours || 0,
                                })];
                        case 8:
                            priceSuggestions = _a.sent();
                            _a.label = 9;
                        case 9:
                            product = new product_entity_1.ProductEntity({
                                id: productId,
                                sellerId: dto.sellerId,
                                sellerName: dto.sellerName || 'Artisan',
                                title: dto.title,
                                description: storyData.polishedStory,
                                story: {
                                    original: dto.story,
                                    polished: storyData.translations,
                                },
                                images: {
                                    original: originalImageUrl,
                                    enhanced: enhancedImageUrl,
                                    polished: polishedImageUrl || enhancedImageUrl,
                                },
                                audio: audioUrls,
                                price: {
                                    amount: dto.price,
                                    currency: 'INR',
                                    suggested: priceSuggestions,
                                },
                                tags: visionAnalysis.tags || [],
                                category: dto.category,
                                status: 'published',
                            });
                            // Step 9: Save to Firestore
                            return [4 /*yield*/, this.firestoreService.createDocument('products', productId, product)];
                        case 10:
                            // Step 9: Save to Firestore
                            _a.sent();
                            // Step 10: Update seller's product list
                            return [4 /*yield*/, this.updateSellerProducts(dto.sellerId, productId)];
                        case 11:
                            // Step 10: Update seller's product list
                            _a.sent();
                            this.logger.log("Product uploaded successfully: ".concat(productId));
                            return [2 /*return*/, {
                                    productId: productId,
                                    status: 'uploaded',
                                    message: 'Product uploaded and processed successfully',
                                    productUrl: "/buyer/product/".concat(productId),
                                }];
                        case 12:
                            error_1 = _a.sent();
                            this.logger.error('Error uploading product:', error_1);
                            throw error_1;
                        case 13: return [2 /*return*/];
                    }
                });
            });
        };
        SellerService_1.prototype.getSellerProducts = function (sellerId) {
            return __awaiter(this, void 0, void 0, function () {
                var products;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.firestoreService.queryDocuments('products', {
                                field: 'sellerId',
                                operator: '==',
                                value: sellerId,
                            })];
                        case 1:
                            products = _a.sent();
                            return [2 /*return*/, products.map(function (product) { return ({
                                    productId: product.id,
                                    title: product.title,
                                    price: product.price.amount,
                                    status: product.status,
                                    imageUrl: product.images.polished || product.images.enhanced,
                                    category: product.category,
                                    views: product.views || 0,
                                    createdAt: product.createdAt,
                                }); })];
                    }
                });
            });
        };
        SellerService_1.prototype.getSellerOrders = function (sellerId) {
            return __awaiter(this, void 0, void 0, function () {
                var orders;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.firestoreService.queryDocuments('orders', {
                                field: 'sellerId',
                                operator: '==',
                                value: sellerId,
                            })];
                        case 1:
                            orders = _a.sent();
                            return [2 /*return*/, orders.map(function (order) {
                                    var _a;
                                    return ({
                                        orderId: order.id,
                                        productId: order.productId,
                                        productTitle: order.productTitle,
                                        buyerName: ((_a = order.shippingAddress) === null || _a === void 0 ? void 0 : _a.name) || 'Anonymous',
                                        amount: order.totalAmount,
                                        status: order.status,
                                        paymentStatus: order.paymentStatus,
                                        createdAt: order.createdAt,
                                    });
                                })];
                    }
                });
            });
        };
        SellerService_1.prototype.getSellerDashboard = function (sellerId) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, products, orders, seller, totalRevenue, pendingOrders;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, Promise.all([
                                this.getSellerProducts(sellerId),
                                this.getSellerOrders(sellerId),
                                this.firestoreService.getDocument('sellers', sellerId),
                            ])];
                        case 1:
                            _a = _b.sent(), products = _a[0], orders = _a[1], seller = _a[2];
                            totalRevenue = orders
                                .filter(function (o) { return o.paymentStatus === 'completed'; })
                                .reduce(function (sum, o) { return sum + o.amount; }, 0);
                            pendingOrders = orders.filter(function (o) { return o.status === 'pending'; }).length;
                            return [2 /*return*/, {
                                    totalProducts: products.length,
                                    totalOrders: orders.length,
                                    totalRevenue: totalRevenue,
                                    pendingOrders: pendingOrders,
                                    recentOrders: orders.slice(0, 5),
                                    topProducts: products.slice(0, 5),
                                    sellerInfo: seller,
                                }];
                    }
                });
            });
        };
        SellerService_1.prototype.generateAudioForAllLanguages = function (productId, translations) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Placeholder for TTS generation
                    // In production, this would call Google Text-to-Speech API
                    return [2 /*return*/, {
                            en: "products/".concat(productId, "/story_en.mp3"),
                            hi: "products/".concat(productId, "/story_hi.mp3"),
                            kn: "products/".concat(productId, "/story_kn.mp3"),
                        }];
                });
            });
        };
        SellerService_1.prototype.updateSellerProducts = function (sellerId, productId) {
            return __awaiter(this, void 0, void 0, function () {
                var seller;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.firestoreService.getDocument('sellers', sellerId)];
                        case 1:
                            seller = _a.sent();
                            if (!seller) return [3 /*break*/, 3];
                            seller.products = seller.products || [];
                            seller.products.push(productId);
                            return [4 /*yield*/, this.firestoreService.updateDocument('sellers', sellerId, {
                                    products: seller.products,
                                    updatedAt: new Date(),
                                })];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        return SellerService_1;
    }());
    __setFunctionName(_classThis, "SellerService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SellerService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SellerService = _classThis;
}();
exports.SellerService = SellerService;
