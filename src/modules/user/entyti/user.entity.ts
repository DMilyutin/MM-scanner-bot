import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { UserRO } from "../dto/user.ro";
import { ProductRO } from "src/modules/product/dto/product.ro";
import { ProductEntity } from "src/modules/product/entity/product.entity";

@Unique('unique_user_param', ['chatId'])
@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // id чата с пользователем
    @Column('int')
    chatId: number


    // Имя пользователя
    @Column('varchar')
    firstName: string;
    
    // Имя пользователя
    @Column('varchar')
    username: string

    // Название тарифа
    @Column('varchar')
    tarifName: string

    // Название тарифа
    @Column({ type: 'timestamptz' })
    activeTatifDate: Date

    @Column('int')
    productLimit: number

    @ManyToMany(
        () => ProductEntity,
        products => products.users,
        {onDelete: 'NO ACTION', onUpdate: 'NO ACTION'})
        @JoinTable({
            name: 'user_product',
            joinColumn:{
                name: 'user_id',
                referencedColumnName: 'id',
            },
            inverseJoinColumn: {
                name: 'product_id',
                referencedColumnName: 'id',
            },
        })
    products?: ProductEntity[]

    get responceObject(): UserRO {
        return {
            id: this.id,
            chatId: this.chatId,
            firstName: this.firstName,
            username: this.username,
            tarifName: this.tarifName,
            activeTatifDate: this.activeTatifDate,
            productLimit: this.productLimit,
            products: this.products?.map( product => product.responceObject )
        }
    }
}