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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const profile_dto_1 = require("./dto/profile.dto");
const users_service_1 = require("./users.service");
const roles_decorator_1 = require("../auth/roles.decorator");
const roles_guard_1 = require("../auth/guards/roles.guard");
const update_user_status_dto_1 = require("./dto/update-user-status.dto");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getProfile(req) {
        return this.usersService.getProfile(req.user.userId);
    }
    async updateProfile(req, dto) {
        return this.usersService.updateProfile(req.user.userId, dto);
    }
    async changePassword(req, dto) {
        return this.usersService.changePassword(req.user.userId, dto);
    }
    async listUsers() {
        return this.usersService.listUsers();
    }
    async updateUserStatus(id, dto, req) {
        return this.usersService.updateUserStatus(id, dto, req.user.userId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, profile_dto_1.UpdateUserProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('change-password'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, profile_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Get)('/admin/users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "listUsers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.Put)('/admin/users/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_status_dto_1.UpdateUserStatusDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserStatus", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map