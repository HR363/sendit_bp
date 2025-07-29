"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickupRequestModule = void 0;
const common_1 = require("@nestjs/common");
const pickup_request_service_1 = require("./pickup-request.service");
const pickup_request_controller_1 = require("./pickup-request.controller");
const prisma_service_1 = require("../common/database/prisma.service");
let PickupRequestModule = class PickupRequestModule {
};
exports.PickupRequestModule = PickupRequestModule;
exports.PickupRequestModule = PickupRequestModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [pickup_request_controller_1.PickupRequestController],
        providers: [pickup_request_service_1.PickupRequestService, prisma_service_1.PrismaService],
    })
], PickupRequestModule);
//# sourceMappingURL=pickup-request.module.js.map