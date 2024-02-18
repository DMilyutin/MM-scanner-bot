import { Column, Entity, ManyToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ProductRO } from "../dto/product.ro";
import { UserEntity } from "src/modules/user/entyti/user.entity";

@Unique('unique_product_param', ['url'])
@Entity('product')
export class ProductEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Ссылка на продукт
    @Column('varchar')
    url: string;

     // Название продукта
     @Column('varchar')
     name: string;

    // Стоимость продукта
    @Column('int')
    price: number

    // Размер кешбека в процентах
    @Column('int')
    persent: number

    // Размер кешбека в рублях
    @Column('int')
    cashback: number

    @ManyToMany(
        () => UserEntity,
        users => users.products,
        {onDelete: 'NO ACTION', onUpdate: 'NO ACTION',},
      )
      users?: UserEntity[];

    get responceObject(): ProductRO {
        return {
            id: this.id,
            name: this.name,
            url: this.url,
            price: this.price,
            persent: this.persent,
            cashback: this.cashback,
            users: this.users?.map(user => user.responceObject)
        }
    }
}