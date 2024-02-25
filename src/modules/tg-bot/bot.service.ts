import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { Bot, Keyboard, InlineKeyboard, GrammyError, HttpError, CommandContext, Context, HearsContext } from "grammy";
import { ProductService } from "../product/product.service";
import { ProductDTO } from "../product/dto/product.dto";
import { UserService } from "../user/user.service";
import { ProductRO } from "../product/dto/product.ro";
import TGErrorMessage from "src/model/tg-error";
import tarifs from "src/model/tarifs";
import { TestScraping } from "../scraping/scaping.tester";
import { UserRO } from "../user/dto/user.ro";
import { log } from "console";
require('dotenv').config()

const API_KEY_BOT = process.env.API_KEY_BOT;
const MEGA_MARKET_URL = process.env.MEGA_MARKET_URL;

@Injectable()
export class TGBotService {

    bot = new Bot(API_KEY_BOT);

    constructor(
        @Inject(forwardRef(() => ProductService))
        private readonly productService: ProductService,
        private readonly userService: UserService
    ) {
        this.startBot()
        //this.st()
    }

    // Тестирование
    private async st() {
        const testScraping = new TestScraping()
        await testScraping.testProduct('https://megamarket.ru/promo-page/details/#?slug=smartfon-apple-iphone-15-pro-256-gb-nano-sim-esim-black-titanium-100061379458&merchantId=40440')
    }

    private async startBot() {

        this.bot.command("start", async (ctx) => {
            console.log(ctx.message.chat.id)
            console.log(ctx.message.from)
            // Получение пользователя по chat.id
            if (ctx.message.from.is_bot) {
                return
            }

            // Проверка налия пользователя. Если пользователя нет - он создается
            const userCheck = await this.checkUser(ctx.message.chat.id, ctx.message.from.first_name, ctx.message.from.username)
            if (!userCheck) {
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
            if (ctx.message.text === 'Добавить товар') {
                await ctx.reply("Укажите URL товара на сайте МегаМаркет")
                return
            }
            else if (ctx.message.text === 'Мой тариф') {
                const tarifMessage = await this.getUserTarif(ctx.message.from.id)
                await ctx.reply(tarifMessage)
                return
            }
            else if (ctx.message.text === 'Мои товары') {
                await this.userProductListReply(ctx)
                return
            }
            else {
                ctx.reply("Я не разобрал вашу команду")
                return
            }
        })

        this.bot.on('callback_query:data', async (ctx) => {
            const callbackData = JSON.parse(ctx.callbackQuery.data)
            if (callbackData.type === 'DEL') {
                const resultMessage = await this.deleteProductFromUser(callbackData.prodId, ctx.update.callback_query.from.id)
                await ctx.reply(resultMessage)
            }
            else if (callbackData.type === 'PAY') {
                await this.buyUserTarif( ctx.update.callback_query.from.id, callbackData.tarif)
            }
            else 
                await ctx.reply("Кнопка не распознана")
            await ctx.answerCallbackQuery()
        })

        this.bot.on('msg::url', async (ctx) => {
            const resultMessage = await this.addProductToUser(ctx.message.from.id, ctx.message.text)
            await ctx.reply(resultMessage)
            return
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

    async sendProductInformation(chatId: number, product: ProductRO) {
        // user id = chat id, мой 347983148 
        const message = `Изменилась цена у товара ${product.name}. Цена: ${product.price}, Кешбек: ${product.cashback} (${product.persent}%)`
        let inlineKeyboard = new InlineKeyboard().url('Перейти на ММ', product.url)
        await this.bot.api.sendMessage(chatId, message, {
            reply_markup: inlineKeyboard
        });
    }



    private async sendTarifInfo(chatId: number) {
        const tarif = tarifs.getTarifs()
        let inlineKeyboardDataTarifBase = JSON.stringify({ type: 'PAY', tarif: 'tarifBase'})
        let inlineKeyboardDataTarifProfi = JSON.stringify({ type: 'PAY', tarif: 'tarifProfi'})

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

    private async checkUser(chatId: number, firsName: string, username: string): Promise<boolean> {
        const user = await this.userService.getUser(chatId, firsName, username)
        return user ? true : false
    }

    // ------------- Generate reply
    private async userProductListReply(ctx: HearsContext<Context>) {
        const user = await this.getUserInfo(ctx.message.from.id)

        const checkUserPayment = user.activeTatifDate >= new Date() ? true : false

        if (!checkUserPayment) {
            await this.userPaymentIsStop(ctx.message.from.id)
            return
        }

        const userProduct = await this.getUserProduct(ctx.message.from.id)
        if (userProduct && userProduct.length > 0) {
            userProduct.map(async (product) => {
                const inlineKeyboardData = JSON.stringify({ type: 'DEL', prodId: product.id })
                const inlineKeyboard = new InlineKeyboard().text('Удалить товар', inlineKeyboardData).url('Перейти на ММ', product.url)
                await ctx.reply(`Товар: ${product.name}, цена: ${product.price} кешбек: ${product.cashback} (${product.persent}%)`, {
                    reply_markup: inlineKeyboard
                })
            })
        } else {
            await ctx.reply("Товаров нет, начнем следить за скидками? Укажите URL на товар")
        }
    }

    // ------------- API
    private async getUserInfo(chatId: number): Promise<UserRO> {
        return await this.userService.getUserByChatId(chatId)
    }

    private async getUserTarif(chatId: number): Promise<string> {
        const user = await this.getUserInfo(chatId)
        if (user.activeTatifDate >= new Date())
            return `Ваш тариф ${user.tarifName}, действует до ${user.activeTatifDate}, лимит товаров к остлеживанию: ${user.productLimit}`
        else
            await this.userPaymentIsStop(chatId)
    }

    private async getUserProduct(chatId: number): Promise<ProductRO[]> {
        return await this.productService.getUserProductByChatId(chatId)
    }

    private async addProductToUser(chatId: number, productURL: string): Promise<string> {
        const user = await this.getUserInfo(chatId)
        const checkUserPayment = user.activeTatifDate >= new Date() ? true : false

        if (!checkUserPayment){
            await this.userPaymentIsStop(chatId)
            return
        }

        // Проверка на лимиты по товарам
        const userProductCount = (await this.productService.getUserProductByChatId(chatId)).length
        if (userProductCount >= user.productLimit)
            return `Достигнут лимит отслеживаемых товаров на вашем Тарифе - ${user.productLimit}`

        if (!productURL.startsWith(MEGA_MARKET_URL))
            return 'Невалидная ссылка! Убедитесь, что вы указали URL товара на сайте МегаМаркет'

        // Добавить товар к отслеживанию
        const newProduct: ProductDTO = {
            url: productURL,
            name: 'Товар в обработке',
            price: 0,
            persent: 0,
            cashback: 0
        }
        const bdProduct = await this.productService.addProductToUser(newProduct, chatId)
        if (bdProduct)
            return "Товар успешно добавлен и находится в обработке. Обработка занимает до 1 часа"
        else
            return "Ошибка при добавлении товара"
    }

    private async deleteProductFromUser(productId: string, chatId: number): Promise<string> {
        const result = await this.productService.unSubcribeProduct(productId, chatId)
        if (result)
            return "Товар удален"
        else
            return "Ошибка при удалении товара"
    }

    private async buyUserTarif(chatId: number, tarifName: string): Promise<string>{
        if (tarifName === 'tarifBase') {
            return "вы покупаете тариф базовый"
        }
        else if (tarifName === 'tarifProfi') {
            return "вы покупаете тариф профи"
        }
        else {
            return "тариф не распознан"
        }
    }

    private async userPaymentIsStop(chatId: number){
        const userPaymentIsStopMessage = 'К сожалению, ваша подписка закончилась( Желаете продлить?'
        await this.bot.api.sendMessage(chatId, userPaymentIsStopMessage);
        await this.sendTarifInfo(chatId)
    }

}









