import puppeteer from 'puppeteer';
import {ProductService } from '../product/product.service'
import { Scraping } from './scraping'
import { Injectable } from '@nestjs/common';
import { ProductRO } from '../product/dto/product.ro';
import { Page } from "puppeteer";

@Injectable()
export class ScrapingService{
    constructor(
        private readonly productService: ProductService 
    ){}

    async updateProduct(){
        const PORTS = [9052, 9053, 9054, 9055, 9056, 9057, 9058]

        const randomPort = PORTS[0]

        const browser = await puppeteer.launch({
            //executablePath: '/usr/bin/chromium-browser',
            headless: 'new',
            //args: ['--proxy-server=socks5://127.0.0.1:9050', '--disable-gpu', '--no-zygote', ]
            defaultViewport: null, 
            args: ['--no-sandbox', '--disable-setuid-sandbox', `--proxy-server=socks5://127.0.0.1:${randomPort}`]
        });


        const page = await browser.newPage(); 
        
        const scraping = new Scraping()
         
        const products = await this.productService.getAllProducts()
        if(!products){
            return
        }
        
        for (let product of products){
            try{
                //await setTimeout(this.startScraping, 3000, scraping, product, page)
                let res = await scraping.startScraping(product.url, page)
                console.log(`Результат анализа страницы: Название${res.name}, цена: ${res.price}`)
                // Если один из параметров изменился, 
                if (res.price !== 0 && (res.price != product.price || res.persent != product.persent || res.cashback != product.cashback)){
                    // 1. Обновляем данные цены в своей базе
                    await this.productService.updateProductPrice(product.id, res)
                    // 2. Делаем рассылку по подписанным пользователям в ТГ если цена изменилась в лучшую сторону
                    if(res.price < product.price || res.persent > product.persent || res.cashback > product.cashback){
                        await this.productService.sendProductInformation(product.id)
                    } 
                }
            }catch(e){
                console.log(e)
            } 
        }
        browser.close(); 
    }

    private async startScraping(scraping: Scraping, product: ProductRO, page: Page){
        
    }
}