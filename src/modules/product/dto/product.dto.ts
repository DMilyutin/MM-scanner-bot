import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ProductDTO {
    
    @ApiProperty({ description: 'Ссылка на продукт', example: 'URL' })
    @IsNotEmpty()
    url: string;

    @ApiProperty({ description: 'Стоимость продукта', example: 120222 })
    @IsNotEmpty()
    price: number

    @ApiProperty({ description: 'Название продукта', example: 'iPhone' })
    @IsNotEmpty()
    name: string

    @ApiProperty({ description: 'Размер кешбека в процентах', example: 12 })
    @IsNotEmpty()
    persent: number

    @ApiProperty({ description: 'Размер кешбека в рублях', example: 12900 })// 
    @IsNotEmpty()
    cashback: number
}