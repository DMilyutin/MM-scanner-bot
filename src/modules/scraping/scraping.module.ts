import { Module } from '@nestjs/common';
import { ScrapingService } from './scraping.service';
import { ProductService } from '../product/product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../product/entity/product.entity';
import { UserEntity } from '../user/entyti/user.entity';
import { UserProductEntity } from '../user-product/userProduct.entity';
import { UserService } from '../user/user.service';
import { TGBotService } from '../tg-bot/bot.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, UserProductEntity, UserEntity])],
  controllers: [],
  providers: [ScrapingService, ProductService, UserService],
  exports: [ScrapingModule]
  
})
export class ScrapingModule {}