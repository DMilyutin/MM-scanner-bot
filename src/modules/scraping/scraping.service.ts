// import puppeteer from 'puppeteer';
const puppeteer = require('puppeteer-extra')
import { ProductService } from '../product/product.service'
import { Scraping } from './scraping'
import { Injectable } from '@nestjs/common';
import UserAgent = require("user-agents")

let mmReferer = 'https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwiWo_TFlreEAxWBQVUIHa1tA48QFnoECAgQAQ&url=https%3A%2F%2Fmegamarket.ru%2F&usg=AOvVaw3PYyPKPT8uFHymNEQ_Z0YX&opi=89978449'
let mmReferer2 = 'https://megamarket.ru'


@Injectable()
export class ScrapingService {
    constructor(
        private readonly productService: ProductService
    ) { }

    async updateProduct() {
        const proxy = '95.165.14.53:57751'
        const proxyUsername = '693cab'
        const proxyPassword = '28c5bd'

        const StealthPlugin = require('puppeteer-extra-plugin-stealth')
        puppeteer.use(StealthPlugin({
            enabledEvasions: new Set(["chrome.app", "chrome.csi", "defaultArgs", "navigator.plugins"])
        }))

        const browser = await puppeteer.launch({
            headless: 'new',
            defaultViewport: null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                `--proxy-server=${proxy}`,  
                //'--proxy-server=185.130.105.109:10000',
                //`--proxy-server=socks5://127.0.0.1:${randomPort}`
            ],
            slowMo: 15,
        });


        const page = await browser.newPage();
        const userAgent = new UserAgent({ deviceCategory: 'mobile' })
        await page.setUserAgent(userAgent.toString())



        const products = await this.productService.getAllProducts()
        if (!products) {
            return
        }

        await page.authenticate({username: proxyUsername, password: proxyPassword});
        await page.goto(mmReferer, {
            waitUntil: ['load'],
            timeout: 60000,
            referer: mmReferer
        })


        //mmReferer = page.url()
        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
        await sleep(2000)

        for (let product of products) {
            try {
                //await setTimeout(this.startScraping, 3000, scraping, product, page)

                let scraping = new Scraping()
                //const page = await browser.newPage();
                //const userAgent = new UserAgent()
                //await page.setUserAgent(userAgent.toString())
                mmReferer = "https://www.google.com"
                let res = await scraping.startScraping(product.url, page, mmReferer)
                //mmReferer = res.referer
                console.log(`Результат анализа страницы: Название${res.name}, цена: ${res.price}, кешбек: ${res.cashback} (${res.persent}%)`)
                // Если один из параметров изменился
                if (res !== null && res.price !== 0 && (res.price != product.price || res.persent != product.persent || res.cashback != product.cashback)) {
                    // 1. Обновляем данные цены в своей базе
                    await this.productService.updateProductPrice(product.id, res)
                    // 2. Делаем рассылку по подписанным пользователям в ТГ если цена изменилась в лучшую сторону
                    if (res.price < product.price || res.persent > product.persent || res.cashback > product.cashback) {
                        await this.productService.sendProductInformation(product.id)
                    }
                }

                scraping = null
                res = null
                //await page.close()
                await sleep(5000)
            } catch (e) {
                console.log(e.message)
            }
        }
        await browser.close();
    }
}