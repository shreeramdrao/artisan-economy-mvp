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
exports.BuyerService = void 0;
var common_1 = require("@nestjs/common");
var uuid_1 = require("uuid");
var order_entity_1 = require("../entities/order.entity");
var BuyerService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var BuyerService = _classThis = /** @class */ (function () {
        function BuyerService_1(firestoreService, razorpayService) {
            this.firestoreService = firestoreService;
            this.razorpayService = razorpayService;
            this.logger = new common_1.Logger(BuyerService.name);
        }
        BuyerService_1.prototype.getProducts = function (query) {
            return __awaiter(this, void 0, void 0, function () {
                var products;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.firestoreService.queryDocuments('products', {
                                field: 'status',
                                operator: '==',
                                value: 'published',
                            })];
                        case 1:
                            products = _a.sent();
                            // Apply filters
                            if (query.category) {
                                products = products.filter(function (p) { return p.category === query.category; });
                            }
                            if (query.minPrice) {
                                products = products.filter(function (p) { return p.price.amount >= query.minPrice; });
                            }
                            if (query.maxPrice) {
                                products = products.filter(function (p) { return p.price.amount <= query.maxPrice; });
                            }
                            // Sort
                            if (query.sortBy === 'price') {
                                products.sort(function (a, b) { return a.price.amount - b.price.amount; });
                            }
                            else if (query.sortBy === 'date') {
                                products.sort(function (a, b) {
                                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                                });
                            }
                            else if (query.sortBy === 'popularity') {
                                products.sort(function (a, b) { return (b.views || 0) - (a.views || 0); });
                            }
                            // Map to response format
                            return [2 /*return*/, products.map(function (product) { return ({
                                    productId: product.id,
                                    title: product.title,
                                    price: product.price.amount,
                                    imageUrl: product.images.polished || product.images.enhanced,
                                    sellerName: product.sellerName,
                                    category: product.category,
                                    tags: product.tags,
                                    rating: 4.5, // Placeholder
                                    location: 'India', // Placeholder
                                }); })];
                    }
                });
            });
        };
        BuyerService_1.prototype.getProductDetails = function (productId) {
            return __awaiter(this, void 0, void 0, function () {
                var product, seller;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.firestoreService.getDocument('products', productId)];
                        case 1:
                            product = _a.sent();
                            if (!product) {
                                throw new common_1.NotFoundException('Product not found');
                            }
                            // Increment view count
                            return [4 /*yield*/, this.firestoreService.updateDocument('products', productId, {
                                    views: (product.views || 0) + 1,
                                })];
                        case 2:
                            // Increment view count
                            _a.sent();
                            return [4 /*yield*/, this.firestoreService.getDocument('sellers', product.sellerId)];
                        case 3:
                            seller = _a.sent();
                            return [2 /*return*/, {
                                    productId: product.id,
                                    title: product.title,
                                    description: product.description,
                                    story: product.story,
                                    images: product.images,
                                    audioUrls: product.audio,
                                    price: product.price.amount,
                                    tags: product.tags,
                                    category: product.category,
                                    sellerInfo: {
                                        id: product.sellerId,
                                        name: product.sellerName,
                                        location: (seller === null || seller === void 0 ? void 0 : seller.location) || 'India',
                                        rating: (seller === null || seller === void 0 ? void 0 : seller.rating) || 4.5,
                                        bio: (seller === null || seller === void 0 ? void 0 : seller.bio) || '',
                                    },
                                    specifications: {
                                        materials: 'Handcrafted materials', // Placeholder
                                        dimensions: 'Standard size', // Placeholder
                                        weight: 'Varies', // Placeholder
                                        careInstructions: 'Handle with care', // Placeholder
                                    },
                                    shippingInfo: {
                                        processingTime: '2-3 days',
                                        estimatedDelivery: '5-7 days',
                                        shippingCost: 0,
                                    },
                                }];
                    }
                });
            });
        };
        BuyerService_1.prototype.checkout = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                var orderId, product, totalAmount, razorpayOrderId, razorpayOrder, order, error_1;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 5, , 6]);
                            orderId = (0, uuid_1.v4)();
                            this.logger.log("Processing checkout for order: ".concat(orderId));
                            return [4 /*yield*/, this.firestoreService.getDocument('products', dto.productId)];
                        case 1:
                            product = _b.sent();
                            if (!product) {
                                throw new common_1.NotFoundException('Product not found');
                            }
                            totalAmount = product.price.amount * dto.quantity;
                            razorpayOrderId = null;
                            if (!(dto.paymentMethod === 'razorpay')) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.razorpayService.createOrder({
                                    amount: totalAmount,
                                    currency: 'INR',
                                    receipt: orderId,
                                })];
                        case 2:
                            razorpayOrder = _b.sent();
                            razorpayOrderId = razorpayOrder.id;
                            _b.label = 3;
                        case 3:
                            order = new order_entity_1.OrderEntity({
                                id: orderId,
                                productId: dto.productId,
                                buyerId: dto.buyerId || 'guest',
                                sellerId: product.sellerId,
                                productTitle: product.title,
                                amount: product.price.amount,
                                quantity: dto.quantity,
                                totalAmount: totalAmount,
                                paymentMethod: dto.paymentMethod,
                                razorpayOrderId: razorpayOrderId,
                                shippingAddress: dto.shippingAddress,
                            });
                            // Save order to Firestore
                            return [4 /*yield*/, this.firestoreService.createDocument('orders', orderId, order)];
                        case 4:
                            // Save order to Firestore
                            _b.sent();
                            this.logger.log("Order created successfully: ".concat(orderId));
                            return [2 /*return*/, {
                                    orderId: orderId,
                                    razorpayOrderId: razorpayOrderId,
                                    amount: totalAmount,
                                    currency: 'INR',
                                    status: 'created',
                                    message: 'Order created successfully',
                                    paymentUrl: dto.paymentMethod === 'upi'
                                        ? "upi://pay?pa=".concat(((_a = product.sellerPaymentDetails) === null || _a === void 0 ? void 0 : _a.upiId) || 'merchant@upi', "&pn=").concat(product.sellerName, "&am=").concat(totalAmount)
                                        : null,
                                }];
                        case 5:
                            error_1 = _b.sent();
                            this.logger.error('Error processing checkout:', error_1);
                            throw error_1;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        BuyerService_1.prototype.verifyPayment = function (paymentData) {
            return __awaiter(this, void 0, void 0, function () {
                var razorpay_order_id, razorpay_payment_id, razorpay_signature, isValid, orders, order, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 6]);
                            razorpay_order_id = paymentData.razorpay_order_id, razorpay_payment_id = paymentData.razorpay_payment_id, razorpay_signature = paymentData.razorpay_signature;
                            return [4 /*yield*/, this.razorpayService.verifyPaymentSignature({
                                    order_id: razorpay_order_id,
                                    payment_id: razorpay_payment_id,
                                    signature: razorpay_signature,
                                })];
                        case 1:
                            isValid = _a.sent();
                            if (!isValid) {
                                throw new Error('Invalid payment signature');
                            }
                            return [4 /*yield*/, this.firestoreService.queryDocuments('orders', {
                                    field: 'razorpayOrderId',
                                    operator: '==',
                                    value: razorpay_order_id,
                                })];
                        case 2:
                            orders = _a.sent();
                            if (!(orders.length > 0)) return [3 /*break*/, 4];
                            order = orders[0];
                            return [4 /*yield*/, this.firestoreService.updateDocument('orders', order.id, {
                                    paymentStatus: 'completed',
                                    razorpayPaymentId: razorpay_payment_id,
                                    razorpaySignature: razorpay_signature,
                                    status: 'confirmed',
                                    updatedAt: new Date(),
                                })];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [2 /*return*/, {
                                success: true,
                                message: 'Payment verified successfully',
                            }];
                        case 5:
                            error_2 = _a.sent();
                            this.logger.error('Error verifying payment:', error_2);
                            throw error_2;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        BuyerService_1.prototype.getCategories = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, [
                            { id: 'pottery', name: 'Pottery', count: 45 },
                            { id: 'textiles', name: 'Textiles', count: 128 },
                            { id: 'jewelry', name: 'Jewelry', count: 89 },
                            { id: 'woodwork', name: 'Woodwork', count: 67 },
                            { id: 'metalwork', name: 'Metalwork', count: 54 },
                            { id: 'paintings', name: 'Paintings', count: 92 },
                            { id: 'sculptures', name: 'Sculptures', count: 31 },
                            { id: 'handicrafts', name: 'Handicrafts', count: 156 },
                            { id: 'leather-goods', name: 'Leather Goods', count: 42 },
                            { id: 'home-decor', name: 'Home Decor', count: 78 },
                            { id: 'traditional-wear', name: 'Traditional Wear', count: 95 },
                            { id: 'accessories', name: 'Accessories', count: 63 },
                        ]];
                });
            });
        };
        BuyerService_1.prototype.getFeaturedProducts = function () {
            return __awaiter(this, void 0, void 0, function () {
                var products;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.firestoreService.queryDocuments('products', {
                                field: 'status',
                                operator: '==',
                                value: 'published',
                            })];
                        case 1:
                            products = _a.sent();
                            // Return top 8 products by views
                            return [2 /*return*/, products
                                    .sort(function (a, b) { return (b.views || 0) - (a.views || 0); })
                                    .slice(0, 8)
                                    .map(function (product) { return ({
                                    productId: product.id,
                                    title: product.title,
                                    price: product.price.amount,
                                    imageUrl: product.images.polished || product.images.enhanced,
                                    sellerName: product.sellerName,
                                    category: product.category,
                                }); })];
                    }
                });
            });
        };
        return BuyerService_1;
    }());
    __setFunctionName(_classThis, "BuyerService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        BuyerService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return BuyerService = _classThis;
}();
exports.BuyerService = BuyerService;
