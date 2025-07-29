"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./database/prisma.service");
const mailer_1 = require("@nestjs-modules/mailer");
const config_1 = require("@nestjs/config");
const mail_service_1 = require("./mail.service");
const pricing_service_1 = require("./pricing.service");
const ejs_adapter_1 = require("@nestjs-modules/mailer/dist/adapters/ejs.adapter");
const path_1 = require("path");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                envFilePath: '.s.env',
                isGlobal: true,
            }),
            mailer_1.MailerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (config) => {
                    const templateDir = (0, path_1.join)(__dirname, '../../templates');
                    console.log('Template directory path:', templateDir);
                    console.log('Current directory:', __dirname);
                    return {
                        transport: {
                            host: config.get('MAIL_HOST'),
                            port: config.get('MAIL_PORT'),
                            auth: {
                                user: config.get('MAIL_USER'),
                                pass: config.get('MAIL_PASS'),
                            },
                        },
                        defaults: {
                            from: config.get('MAIL_FROM') || 'no-reply@sendit.com',
                        },
                        template: {
                            dir: templateDir,
                            adapter: new ejs_adapter_1.EjsAdapter(),
                            options: {
                                strict: false,
                            },
                        },
                    };
                },
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [prisma_service_1.PrismaService, mail_service_1.MailService, pricing_service_1.PricingService],
        exports: [prisma_service_1.PrismaService, mailer_1.MailerModule, mail_service_1.MailService, pricing_service_1.PricingService],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map