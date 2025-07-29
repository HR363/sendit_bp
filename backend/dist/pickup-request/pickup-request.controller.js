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
exports.PickupRequestController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const pickup_request_service_1 = require("./pickup-request.service");
const create_pickup_request_dto_1 = require("./dto/create-pickup-request.dto");
let PickupRequestController = class PickupRequestController {
    pickupRequestService;
    constructor(pickupRequestService) {
        this.pickupRequestService = pickupRequestService;
    }
    async createPickupRequest(dto, req) {
        return this.pickupRequestService.createPickupRequest(dto, req.user.userId);
    }
    async getPendingPickupRequests() {
        return this.pickupRequestService.getPendingPickupRequests();
    }
    async getPickupRequestById(id) {
        return this.pickupRequestService.getPickupRequestById(id);
    }
    async completePickupRequest(id, req) {
        return this.pickupRequestService.completePickupRequest(id, req.user.userId);
    }
};
exports.PickupRequestController = PickupRequestController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pickup_request_dto_1.CreatePickupRequestDto, Object]),
    __metadata("design:returntype", Promise)
], PickupRequestController.prototype, "createPickupRequest", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('COURIER_AGENT'),
    (0, common_1.Get)('pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PickupRequestController.prototype, "getPendingPickupRequests", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('COURIER_AGENT'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PickupRequestController.prototype, "getPickupRequestById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('COURIER_AGENT'),
    (0, common_1.Patch)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PickupRequestController.prototype, "completePickupRequest", null);
exports.PickupRequestController = PickupRequestController = __decorate([
    (0, common_1.Controller)('pickup-requests'),
    __metadata("design:paramtypes", [pickup_request_service_1.PickupRequestService])
], PickupRequestController);
//# sourceMappingURL=pickup-request.controller.js.map