"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelsModule = void 0;
const common_1 = require("@nestjs/common");
const parcels_controller_1 = require("./parcels.controller");
const parcels_service_1 = require("./parcels.service");
const common_module_1 = require("../common/common.module");
let ParcelsModule = class ParcelsModule {
};
exports.ParcelsModule = ParcelsModule;
exports.ParcelsModule = ParcelsModule = __decorate([
    (0, common_1.Module)({
        imports: [common_module_1.CommonModule],
        controllers: [parcels_controller_1.ParcelsController],
        providers: [parcels_service_1.ParcelsService]
    })
], ParcelsModule);
//# sourceMappingURL=parcels.module.js.map