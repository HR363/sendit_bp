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
exports.ParcelsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const create_parcel_dto_1 = require("./dto/create-parcel.dto");
const update_parcel_dto_1 = require("./dto/update-parcel.dto");
const assign_courier_dto_1 = require("./dto/assign-courier.dto");
const update_parcel_status_dto_1 = require("./dto/update-parcel-status.dto");
const parcels_service_1 = require("./parcels.service");
let ParcelsController = class ParcelsController {
    parcelsService;
    constructor(parcelsService) {
        this.parcelsService = parcelsService;
    }
    createParcel(dto, req) {
        return this.parcelsService.createParcel(dto, req.user);
    }
    updateParcel(id, dto, req) {
        return this.parcelsService.updateParcel(id, dto, req.user);
    }
    assignCourier(id, dto) {
        return this.parcelsService.assignCourier(id, dto);
    }
    updateStatus(id, dto, req) {
        return this.parcelsService.updateStatus(id, dto, req.user);
    }
    getSentParcels(req) {
        return this.parcelsService.getSentParcels(req.user.userId);
    }
    getReceivedParcels(req) {
        return this.parcelsService.getReceivedParcels(req.user.userId);
    }
    getAssignedParcels(req) {
        return this.parcelsService.getAssignedParcels(req.user.userId);
    }
    getAllParcels() {
        return this.parcelsService.getAllParcels();
    }
    getParcelById(id, req) {
        return this.parcelsService.getParcelById(id, req.user);
    }
    getParcelStatusHistory(id, req) {
        return this.parcelsService.getParcelStatusHistory(id, req.user);
    }
    softDeleteParcel(id, req) {
        return this.parcelsService.softDeleteParcel(id, req.user);
    }
};
exports.ParcelsController = ParcelsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'COURIER_AGENT'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_parcel_dto_1.CreateParcelDto, Object]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "createParcel", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'COURIER_AGENT'),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_parcel_dto_1.UpdateParcelDto, Object]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "updateParcel", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Put)(':id/assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_courier_dto_1.AssignCourierDto]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "assignCourier", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'COURIER_AGENT'),
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_parcel_status_dto_1.UpdateParcelStatusDto, Object]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('sent'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "getSentParcels", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('received'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "getReceivedParcels", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('COURIER_AGENT'),
    (0, common_1.Get)('assigned'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "getAssignedParcels", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Get)('admin/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "getAllParcels", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "getParcelById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/history'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "getParcelStatusHistory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'COURIER_AGENT'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ParcelsController.prototype, "softDeleteParcel", null);
exports.ParcelsController = ParcelsController = __decorate([
    (0, common_1.Controller)('parcels'),
    __metadata("design:paramtypes", [parcels_service_1.ParcelsService])
], ParcelsController);
//# sourceMappingURL=parcels.controller.js.map