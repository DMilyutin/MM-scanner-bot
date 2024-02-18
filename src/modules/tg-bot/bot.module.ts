import { Global, Module } from '@nestjs/common';
import { TGBotService } from './bot.service';
import { ProductService } from '../product/product.service';
import { ProductModule } from '../product/product.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../product/entity/product.entity';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/entyti/user.entity';
import { UserProductEntity } from '../user-product/userProduct.entity';
import { UserModule } from '../user/user.module';

@Global()
@Module({
    imports: [
      UserModule, ProductModule,
      TypeOrmModule.forFeature([ProductEntity, UserProductEntity, UserEntity])],
    providers: [TGBotService, ProductService, UserService],
    exports: [TGBotService]
  })
  export class BotModule {}