import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entyti/user.entity';
import { Repository } from 'typeorm';
import { UserRO } from './dto/user.ro';
import { ProductEntity } from '../product/entity/product.entity';
import tarifs from 'src/model/tarifs';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ){}

    async getUser(chatId: number, firstName: string, username: string): Promise<UserRO> {
        const user = await this.userRepository.findOne({where: {chatId: chatId}})
        if(!user){
            return await this.createUser(chatId, firstName, username, false) as UserRO
        }
        return user.responceObject
    }
    
    async getUserEntity(chatId: number): Promise<UserEntity> {
        const user = await this.userRepository.findOne({where: {chatId: chatId}})
        if(!user){
            //return await this.createUser(chatId, firstName, username, true) as UserEntity
        }
        return user
    }

    private async createUser(chatId: number, firstName: string, username: string, returnEntyti: boolean): Promise<UserRO | UserEntity> {
        try{
            const trialTarif = tarifs.getTarifs().tarifTrial
            const today = new Date();
            const newUser = this.userRepository.create({
                chatId: chatId,
                firstName: firstName,
                username: username, 
                tarifName:  trialTarif.name,
                activeTatifDate: new Date(today.setDate(today.getDate() + trialTarif.paymentDay)),
                productLimit: trialTarif.productLimit,
            })

            await this.userRepository.save(newUser).then( ()=> {
                // доп действие
            })
            if (returnEntyti)
                return newUser
            else
                return newUser.responceObject
        }catch(e){
            throw new HttpException('Ошибка при создании пользователя', HttpStatus.NOT_FOUND);
        }
    }

    async getUsersByProduct(productEntity: ProductEntity): Promise<UserRO[]>{
        const users = await this.userRepository.find({where: {products: productEntity}})
        return users.map(user => user.responceObject)
    }

    async getUserByChatId(chatId: number): Promise<UserRO>{
        const user = await this.userRepository.findOne({where: {chatId: chatId}})
        if(!user){
            // добавить обработку ошибки, такого быть не должно
        }
        return user.responceObject
    }

}
