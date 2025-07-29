"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingController = void 0;
const common_1 = require("@nestjs/common");
const tracking_service_1 = require("./tracking.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let TrackingController = class TrackingController {
    trackingService;
    constructor(trackingService) {
        this.trackingService = trackingService;
    }
    async getParcelTracking(parcelId) {
        return this.trackingService.getParcelTracking(parcelId);
    }
    async getLiveTracking(parcelId) {
        return this.trackingService.getLiveTracking(parcelId);
    }
    async getPublicTracking(trackingNumber) {
        return this.trackingService.getPublicTracking(trackingNumber);
    }
};
exports.TrackingController = TrackingController;
__decorate([
    (0, common_1.Get)(':parcelId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('parcelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "getParcelTracking", null);
__decorate([
    (0, common_1.Get)(':parcelId/live'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('parcelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "getLiveTracking", null);
__decorate([
    (0, common_1.Get)(':trackingNumber/public'),
    __param(0, (0, common_1.Param)('trackingNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TrackingController.prototype, "getPublicTracking", null);
exports.TrackingController = TrackingController = __decorate([
    (0, common_1.Controller)('tracking'),
    __metadata("design:paramtypes", [tracking_service_1.TrackingService])
], TrackingController);
//# sourceMappingURL=tracking.controller.js.map