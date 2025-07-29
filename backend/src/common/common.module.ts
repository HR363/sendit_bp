import { Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { PricingService } from './pricing.service';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.s.env',
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const templateDir = join(__dirname, '../../templates');
        console.log('Template directory path:', templateDir);
        console.log('Current directory:', __dirname);
        
        return {
          transport: {
            host: config.get<string>('MAIL_HOST'),
            port: config.get<number>('MAIL_PORT'),
            auth: {
              user: config.get<string>('MAIL_USER'),
              pass: config.get<string>('MAIL_PASS'),
            },
          },
          defaults: {
            from: config.get<string>('MAIL_FROM') || 'no-reply@sendit.com',
          },
          template: {
            dir: templateDir,
            adapter: new EjsAdapter(),
            options: {
              strict: false,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [PrismaService, MailService, PricingService],
  exports: [PrismaService, MailerModule, MailService, PricingService],
})
export class CommonModule {} 