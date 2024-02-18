import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ScrapingModule } from './modules/scraping/scraping.module';
import { ProductModule } from './modules/product/product.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './modules/product/entity/product.entity';
import { BotModule } from './modules/tg-bot/bot.module';
import { UserModule } from './modules/user/user.module';
import { UserEntity } from './modules/user/entyti/user.entity';
import { UserProductEntity } from './modules/user-product/userProduct.entity';
import { CronModule } from './modules/cron/cron.module';
require('dotenv').config();

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ScrapingModule,
    ProductModule,
    BotModule,
    UserModule,
    CronModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      entities: [ProductEntity, UserEntity, UserProductEntity],
      host: process.env.HOST,
      port: parseInt(process.env.PORT),
      username: process.env.POSTGRES_USER, 
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.DATABASE,
      synchronize: true
    }),
  ],
  controllers: [],
  providers: [],
  exports: [BotModule]
})
export class AppModule {}
