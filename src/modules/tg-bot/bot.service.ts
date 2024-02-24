import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { Bot, Keyboard, InlineKeyboard, GrammyError, HttpError } from "grammy";
import { ProductService } from "../product/product.service";
import { ProductDTO } from "../product/dto/product.dto";
import { UserService } from "../user/user.service";
import { ProductRO } from "../product/dto/product.ro";
import TGErrorMessage from "src/model/tg-error";
import tarifs from "src/model/tarifs";
import { TestScraping } from "../scraping/scaping.tester";
require('dotenv').config()

const API_KEY_BOT = process.env.API_KEY_BOT;
const MEGA_MARKET_URL = process.env.MEGA_MARKET_URL;

@Injectable()
export class TGBotService{

    bot = new Bot(API_KEY_BOT); 

    constructor(
        @Inject(forwardRef(() => ProductService))
        private readonly productService: ProductService,
        private readonly userService: UserService
    ){
        this.startBot()
        //this.st() 
    }

    // Тестирование
    private async st(){
        const testScraping = new TestScraping()
        await testScraping.testProduct('https://megamarket.ru/promo-page/details/#?slug=smartfon-apple-iphone-15-pro-256-gb-nano-sim-esim-black-titanium-100061379458&merchantId=40440')
    }

    private async startBot() {
        
        this.bot.command("start", async (ctx) => {
            // Получение пользователя по chat.id
            if(ctx.message.from.is_bot){
                return
            }
            console.log(ctx.message.chat.id)
            console.log(ctx.message.from)

            const userCheck = await this.checkUser(ctx.message.chat.id, ctx.message.from.first_name, ctx.message.from.username)
            if(!userCheck){
                await ctx.reply("Не удалось получить пользователя, попробуйте позднее")
                return
            }

            const startKeyboard = new Keyboard()
                .text('Добавить товар')
                .text('Мои товары')
                .row()
                .text('Мой тариф')
                .resized();

            await ctx.reply("Начнем отслеживать скидки? Выберете пункт Добавить товар и укажите URL на товар", {
                reply_markup: startKeyboard
            })
        });

        this.bot.hears(['Добавить товар', 'Мои товары', 'Мой тариф'], async (ctx) => {
            if (ctx.message.text === 'Добавить товар'){
                await ctx.reply("Укажите URL товара на сайте МегаМаркет")
                return
            }
            else if(ctx.message.text === 'Мой тариф'){
                const user = await this.userService.getUserByChatId(ctx.message.from.id)
                if(user.activeTatifDate >= new Date()){
                    await ctx.reply(`Ваш тариф ${user.tarifName}, действует до ${user.activeTatifDate}`)
                }
                else{
                    await ctx.reply(`Ваша подписка истекла ${user.activeTatifDate}`)
                }
                return
            }
            else{
                const userProduct = await this.getUserProduct(ctx.message.from.id, ctx.message.from.first_name, ctx.message.from.username)
                try{
                    if(userProduct instanceof TGErrorMessage){
                        await ctx.reply('К сожалению, ваша подписка закончилась( Желаете продлить?')
                        this.sendTarifInfo(ctx.message.from.id)
                    }else{
                        if(userProduct && userProduct.length > 0){
                            userProduct.map( async (product) => {
                                let inlineKeyboardData = JSON.stringify({
                                    type: 'DEL',
                                    prodId: product.id
                                })
                                
                                let inlineKeyboard = new InlineKeyboard()
                                .text('Удалить товар', inlineKeyboardData)
                                .url('Перейти на ММ', product.url)
        
                                // `Изменилась цена у товара ${product.name}. Цена: ${product.price}, Кешбек: ${product.cashback} (${product.persent}%)
                                await ctx.reply(`Товар: ${product.name}, цена: ${product.price} кешбек: ${product.cashback} (${product.persent}%)`, {
                                    reply_markup: inlineKeyboard
                                }) 
                            })
                        }else{
                            await ctx.reply("Товаров нет, начнем следить за скидками? Укажите URL на товар")
                        }
                    }
                }catch(e){

                }
            }
        })

        this.bot.on('callback_query:data', async (ctx) => {
            const callbackData = JSON.parse(ctx.callbackQuery.data)
            if(callbackData.type === 'DEL'){
                const result = await this.productService.unSubcribeProduct(callbackData.prodId, ctx.update.callback_query.from.id)
                if(result)
                    await ctx.reply("Товар удален")
                else
                    await ctx.reply("Ошибка при удалении товара")
                await ctx.answerCallbackQuery()
                return
            }
            else if (callbackData.type === 'PAY'){
                if(callbackData.tarif === 'tarifBase'){
                    await ctx.reply("вы покупаете тариф базовый")
                }else{
                    // callbackData.tarif === 'tarifProfi'
                    await ctx.reply("вы покупаете тариф профи")
                }
                await ctx.answerCallbackQuery()
                return
            }
            await ctx.reply("Кнопка не распознана")
            await ctx.answerCallbackQuery()
        })

        this.bot.on('msg::url', async (ctx) => {
            if(!await this.checkUserPayment(ctx.message.from.id)){
                await ctx.reply('К сожалению, ваша подписка закончилась( Желаете продлить?')
                this.sendTarifInfo(ctx.message.from.id)
                return
            }

            const url = ctx.message.text

            if (!url.startsWith(MEGA_MARKET_URL)){
                await ctx.reply('Невалидная ссылка! Убедитесь, что вы указали URL товара на сайте МегаМаркет')
                return
            }
            else{
                // Добавить товар к отслеживанию
                const newProduct : ProductDTO ={
                    url: url,
                    name: 'Товар в обработке',
                    price: 0,
                    persent: 0,
                    cashback: 0
                }
                const bdProduct = await this.productService.addProductToUser(newProduct, ctx.message.from.id, ctx.message.from.first_name, ctx.message.from.username)
                if(bdProduct){
                    await ctx.reply("Товар успешно добавлен и находится в обработке. Обработка занимает до 1 часа")
                    return
                }else{
                    await ctx.reply("Ошибка при добавлении товара")
                    return
                }                
            }
        })


        // Handle other messages.
        this.bot.on("message", (ctx) => {
            ctx.reply("Я не разобрал вашу команду")
        });

        this.bot.catch((err) => {
            const ctx = err.ctx;
            console.error(`Error while handling update ${ctx.update.update_id}:`);
            const e = err.error;
            if (e instanceof GrammyError) {
              console.error("Error in request:", e.description);
            } else if (e instanceof HttpError) {
              console.error("Could not contact Telegram:", e);
            } else {
              console.error("Unknown error:", e);
            }
          });

        this.bot.start(); 
    } 
    
    async sendProductInformation(chatId: number, product: ProductRO){
        // user id = chat id, мой 347983148 
        const message = `Изменилась цена у товара ${product.name}. Цена: ${product.price}, Кешбек: ${product.cashback} (${product.persent}%)`
        let inlineKeyboard = new InlineKeyboard().text('Перейти на сайт', 'open_site').text('Поддержать проект', 'donat')
        await this.bot.api.sendMessage(chatId, message, {
            reply_markup: inlineKeyboard
        });
    }

    private async getUserProduct(chatId: number, firstName: string, username: string): Promise<ProductRO[] | TGErrorMessage>{
        const userProduct = await this.productService.getUserProduct(chatId, firstName, username)
        return userProduct
    }

    private async checkUser(chatId: number, firsName: string, username: string): Promise<boolean>{
        const user = await this.userService.getUser(chatId, firsName, username)

        if(user) return true
        else return false
    }

    private async checkUserPayment(chatId: number): Promise<boolean>{
        const user = await this.userService.getUserByChatId(chatId)
        if(user.activeTatifDate >= new Date())
            return true
        else
            return false
    }

    private async sendTarifInfo(chatId: number){
        const tarif = tarifs.getTarifs()

        let inlineKeyboardDataTarifBase = JSON.stringify({
            type: 'PAY',
            tarif: 'tarifBase'
        })

        let inlineKeyboardDataTarifProfi = JSON.stringify({
            type: 'PAY',
            tarif: 'tarifProfi'
        })

        let inlineKeyboard = new InlineKeyboard()
                        .text(`Тариф ${tarif.tarifBase.name}`, inlineKeyboardDataTarifBase)
                        .text(`Тариф ${tarif.tarifProfi.name}`, inlineKeyboardDataTarifProfi)


        // const message = '<b>Hi!</b> <i>Welcome</i> to <a href="https://grammy.dev">grammY</a>.'
        const message = `Мы подготовили несколько тарифов для вас:
<b>Тариф ${tarif.tarifBase.name}</b> на ${tarif.tarifBase.paymentDay} дней
Лимит отслеживаемых товаров: ${tarif.tarifBase.productLimit}
Цена: ${tarif.tarifBase.price}
\n
<b>Тариф ${tarif.tarifProfi.name}</b> на ${tarif.tarifProfi.paymentDay} дней
Лимит отслеживаемых товаров: ${tarif.tarifProfi.productLimit}
Цена: ${tarif.tarifProfi.price}
        `
        await this.bot.api.sendMessage(chatId, message, {
            reply_markup: inlineKeyboard,
            parse_mode: "HTML",
        });
    }
    
}
 
    

    
    
    

    

