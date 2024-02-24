import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entity/product.entity';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/entyti/user.entity';
import { UserProductEntity } from '../user-product/userProduct.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, UserEntity, UserProductEntity])],
  controllers: [ProductController],
  providers: [ProductService, UserService],
  exports: [ProductService]
})
export class ProductModule {}
