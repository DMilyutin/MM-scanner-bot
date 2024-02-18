import puppeteer from 'puppeteer';
import {ProductService } from '../product/product.service'
import { Scraping } from './scraping'
import { Injectable } from '@nestjs/common';
import { log } from 'console';

@Injectable()
export class ScrapingService{
    constructor(
        private readonly productService: ProductService 
    ){}

    async updateProduct(){
        console.log('updateProduct Called every 10 seconds')
        const browser = await puppeteer.launch({
            headless: true,
            //args: ['--proxy-server=socks5://127.0.0.1:9050']
        });

        const page = await browser.newPage();
        const scraping = new Scraping()
         
        const products = await this.productService.getAllProducts()
        if(!products){
            console.log('нет - ' + products.length)
            return
        }
        
        for (let product of products){
            try{
                let res = await scraping.startScraping(product.url, page)
                console.log(`Результат анализа страницы: Название${res.name}, цена: ${res.price}`)
                // Если один из параметров изменился, 
                if (res.price != product.price || res.persent != product.persent || res.cashback != product.cashback){
                    // 1. Обновляем данные цены в своей базе
                    log('цена на сайте изменилась')
                    await this.productService.updateProductPrice(product.id, res)
                    // 2. Делаем рассылку по подписанным пользователям в ТГ если цена изменилась в лучшую сторону
                    if(res.price < product.price || res.persent > product.persent || res.cashback > product.cashback){
                        log('цена на сайте изменилась в лучшую сторону, нужно отправить оповещение')
                        this.productService.sendProductInformation(product.id)
                    } 
                }
            }catch(e){
                console.log(e)
            } 
        }
        browser.close(); 
    }
}