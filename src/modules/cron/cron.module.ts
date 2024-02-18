import { Module } from "@nestjs/common";
import { CronService } from "./cron.service";
import { ScrapingService } from "../scraping/scraping.service";
import { ProductService } from "../product/product.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductEntity } from "../product/entity/product.entity";
import { UserProductEntity } from "../user-product/userProduct.entity";
import { UserService } from "../user/user.service";
import { UserEntity } from "../user/entyti/user.entity";
import { TGBotService } from "../tg-bot/bot.service";

@Module({
    imports: [TypeOrmModule.forFeature([ProductEntity, UserProductEntity, UserEntity])],
    controllers: [],
    providers: [CronService, ScrapingService, ProductService, UserService],
    exports: [CronModule] 
    
  })
  export class CronModule {}