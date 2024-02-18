import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UserDTO { 

    @ApiProperty({ description: 'ID чата с пользователем', example: 1234 })
    @IsNotEmpty()
    chatId: number

    @ApiProperty({ description: 'Имя пользователя', example: 'Дмитрий' })
    firstName: string;

    @ApiProperty({ description: 'username пользователя', example: 'Дмитрий' })
    username: string;

    @ApiProperty({ description: 'название тарифа', example: 'простой' })
    tarifName: string

    @ApiProperty({ description: 'дата действия тарифа', example: 'Дмитрий' })
    activeTatifDate: Date

    @ApiProperty({ description: 'лимит продуктов пользователя', example: 10 })
    productLimit: number
}