import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { UserRO } from "src/modules/user/dto/user.ro";

export class ProductRO {
    
    @ApiProperty({ description: 'Уникальный id продукта', example: '' })
    id: string;

    @ApiProperty({ description: 'Название продукта', example: 'iPhone' })
    @IsNotEmpty()
    name: string
    
    @ApiProperty({ description: 'Ссылка на продукт', example: 'URL' })
    @IsNotEmpty()
    url: string;

    @ApiProperty({ description: 'Стоимость продукта', example: 120222 })
    @IsNotEmpty()
    price: number

    @ApiProperty({ description: 'Размер кешбека в процентах', example: 12 })
    @IsNotEmpty()
    persent: number

    @ApiProperty({ description: 'Размер кешбека в рублях', example: 12900 })// 
    @IsNotEmpty()
    cashback: number

    @ApiProperty({ description: 'Подписчики на продукт', example: UserRO })// 
    users: UserRO[]
}