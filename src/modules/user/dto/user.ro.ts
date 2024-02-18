import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { ProductRO } from "src/modules/product/dto/product.ro";

export class UserRO { 

    @ApiProperty({ description: 'ID Пользователя', example: 'wqre2r-23r' })
    @IsNotEmpty()
    id: string;

    @ApiProperty({ description: 'ID чата с пользователем', example: 1234 })
    @IsNotEmpty()
    chatId: number

    @ApiProperty({ description: 'Имя пользователя', example: 'Дмитрий' })
    firstName: string;

    @ApiProperty({ description: 'username пользователя', example: 'Дмитрий' })
    username: string;

    @ApiProperty({ description: 'Продукты пользователя', example: ProductRO })
    products: ProductRO[]

    @ApiProperty({ description: 'название тарифа', example: 'Базовый' })
    tarifName: string

    @ApiProperty({ description: 'дата действия тарифа', example: 'Дмитрий' })
    activeTatifDate: Date

    @ApiProperty({ description: 'лимит продуктов пользователя', example: 10 })
    productLimit: number
}