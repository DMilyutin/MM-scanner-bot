import { Page } from "puppeteer";
import { Price } from "src/model/prise";
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

export class Scraping{

    async startScraping(url: string, page: Page): Promise<Price>  {

        let totalPrice: Price = {
            name: '',
            price: 0,
            persent: 0,
            cashback: 0
        }

        try{
            await page.goto(url);

            const element = await page.waitForSelector('.pdp-header__title_only-title')
            console.log('element + ' + element)

            const content = await page.content();
            const CL = cheerio.load(content);
        
            // Получаем цену
            CL('.sales-block-offer-price__price-final').slice(0, 1).each((idx, elem) => { 
                const priceTitle = CL(elem).text();
                const priseBad = priceTitle.trim().replaceAll(' ', '').replaceAll('₽', '')
                totalPrice.price = Number(priseBad)
            })
        
            // Получаем процент кешбека
            CL('.bonus-percent').slice(0, 1).each((idx, elem) => { 
                const persentTitle = CL(elem).text();
                const persentBad = persentTitle.trim().replaceAll(' ', '').replaceAll('%', '')
                totalPrice.persent = Number(persentBad)
            })
        
            // Получаем размер кешбека
            CL('.bonus-amount').slice(0, 1).each((idx, elem) => { 
                const cashbackTitle = CL(elem).text();
                const cashbackBad = cashbackTitle.trim().replaceAll(' ', '').replaceAll('₽', '')
                console.log('cashbackBad - ' + cashbackBad) 
                totalPrice.cashback = Number(cashbackBad)
            })

            // Получаем название товара
            CL('.pdp-header__title_only-title').slice(0, 1).each((idx, elem) => { 
                const productTitle = CL(elem).text();
                //const cashbackBad = cashbackTitle.trim().replaceAll(' ', '').replaceAll('₽', '')
                totalPrice.name = productTitle.trim()
            })

            return totalPrice
        }catch(e){
            console.log(e)
            return
        }
    }
}





