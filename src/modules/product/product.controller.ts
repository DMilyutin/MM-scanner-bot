import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductRO } from './dto/product.ro';
import { ProductDTO } from './dto/product.dto';

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Get()
    getProducts(): Promise<ProductRO[]>{
        return this.productService.getAllProducts()
    }

    @Post('/create')
    createProduct(@Body() productDTO: ProductDTO): Promise<ProductRO>{
        return this.productService.addProductToUser(productDTO, 123, 'Пользователь тест', 'testUserNmae')
    }
}
