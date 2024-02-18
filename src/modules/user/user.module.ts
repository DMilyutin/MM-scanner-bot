import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entyti/user.entity';
import { ProductEntity } from '../product/entity/product.entity';
import { ProductService } from '../product/product.service';
import { UserProductEntity } from '../user-product/userProduct.entity';
import { TGBotService } from '../tg-bot/bot.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ProductEntity, UserProductEntity])],
  controllers: [UserController],
  providers: [UserService, ProductService],
  exports:[UserService]
}) 
export class UserModule {}
