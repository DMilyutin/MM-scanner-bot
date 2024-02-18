import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ProductEntity } from "../product/entity/product.entity";
import { UserEntity } from "../user/entyti/user.entity";

@Entity('user_product')
export class UserProductEntity {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @PrimaryColumn({ name: 'product_id' })
  productId: string;

  @ManyToOne(
    () => UserEntity,
    users => users.products,
    {onDelete: 'NO ACTION', onUpdate: 'NO ACTION'}
  )
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  users: UserEntity[];

  @ManyToOne(
    () => ProductEntity,
    produts => produts.users,
    {onDelete: 'NO ACTION', onUpdate: 'NO ACTION'}
  )
  @JoinColumn([{ name: 'product_id', referencedColumnName: 'id' }])
  produts: ProductEntity[];
}