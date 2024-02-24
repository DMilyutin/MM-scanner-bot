import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { ProductEntity } from './entity/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRO } from './dto/product.ro';
import { ProductDTO } from './dto/product.dto';
import { Price } from 'src/model/prise';
import { UserService } from '../user/user.service';
import { UserProductEntity } from '../user-product/userProduct.entity';
import { TGBotService } from '../tg-bot/bot.service';
import { log } from 'console';
import TGErrorMessage from 'src/model/tg-error';


@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
        @InjectRepository(UserProductEntity)
        private readonly userProductRepository: Repository<UserProductEntity>,
        private readonly userService: UserService,
        //@Inject(forwardRef(() => TGBotService))
        private readonly tgBotService: TGBotService
    ){}

    async getAllProducts(): Promise<ProductRO[]> {
        const products = await this.productRepository.find()
        if (!products) 
            throw new HttpException('Продукты не найдены', HttpStatus.NOT_FOUND);

        return products.map( (product) => product.responceObject);
    }

    async getUserProduct(chatId: number, firstName: string, username: string): Promise<ProductRO[] | TGErrorMessage> {
        const user = await this.userService.getUser(chatId, firstName, username)
        if(user.activeTatifDate >= new Date()){
            const products = await this.productRepository.find({where: {users: user}})
            console.log(products)
            return (products.map( product => product.responceObject)) as ProductRO[]
        }
        else{
            console.log('у пользователя закончилась подписка')
            let error = new TGErrorMessage('У вас закончилась подписка')
            return error as TGErrorMessage
        } 
    }

    async addProductToUser(productDTO: ProductDTO, chatId: number, firstName: string, username: string): Promise<ProductRO>{
        try{
            const user = await this.userService.getUserEntity(chatId, firstName, username)
            let product = await this.productRepository.findOne({where: {url: productDTO.url}})

            if (!product){
                product = await this.createProduct(productDTO)
            }

            const subscribe = this.userProductRepository.create({
                userId: user.id,
                productId: product.id
            })

            await this.userProductRepository.save(subscribe)


            return product.responceObject
        }catch(e){
            console.log(e)
        }
    }

    async createProduct(productDTO: ProductDTO): Promise<ProductEntity>{
        console.log('createProduct - ' + productDTO.url)
        
        try{
            const newProduct = this.productRepository.create({
                ...productDTO,
                price: 1000000,
                persent: 1,
                cashback: 1,
                name:'Товар в обработке'
            })
    
            await this.productRepository.save(newProduct).then(()=> {
                // доп действие
            })
    
            return newProduct
        }catch(e){
            console.log(e)
            throw new HttpException('Ошибка при добавлении продукта', HttpStatus.NOT_FOUND);
        }
        
    }

    async updateProductPrice(productId : string, newPrice: Price): Promise<Boolean>{
        try{
            const product = await this.productRepository.findOne({ where: {id:productId } })
            if (!product) 
                throw new HttpException('Продукт не найден', HttpStatus.NOT_FOUND);

            console.log('Продукт к поиску ' + productId + '. Продукт найден ' + product.id)

            await this.productRepository
                .save({...product, price: newPrice.price, persent: newPrice.persent, cashback: newPrice.cashback, name: newPrice.name})
                .then( () => {
                    // добавить доп действия при обновлении продукта
                    console.log('Обновился продукт с id - ' + productId)
                })
            return true    
        }catch(e){
            return false
        }
    }

    async unSubcribeProduct(productId : string, chatId: number): Promise<boolean>{
        try{
            const user = await this.userService.getUserByChatId(chatId)
            const findProduct = await this.userProductRepository.findOne({where: {userId: user.id, productId: productId}})

            if (!findProduct) 
                return false

            await this.userProductRepository.remove(findProduct)
            .then( () => {
                // добавить доп действия при удалении продукта
            })

            // Добавить удаление товаров при отуствии подписчиков
            return true 
        }catch(e){
            return false
        }
        
    }

    async deleteProduct(productId : string){
        const product = await this.productRepository.findOne({ where: {id:productId } })
        if (!product) 
            throw new HttpException('Продукт не найден', HttpStatus.NOT_FOUND);

        await this.productRepository.remove(product)
        .then( () => {
            // добавить доп действия при удалении продукта
        })
    }

    async sendProductInformation(productId: string){
        log('ProductService sendProductInformation')
        const product = await this.productRepository.findOne({where: {id: productId}})
        const users = await this.userService.getUsersByProduct(product)

        for (let user of users) {
            if(user.activeTatifDate >= new Date()){
                console.log('у пользователя подписка активна и обновился товар у - ' + user.username)
                await this.tgBotService.sendProductInformation(user.chatId, product.responceObject)
            }
            else{
                console.log('у пользователя закончилась подписка')
            }
        }
        return
    }
}
