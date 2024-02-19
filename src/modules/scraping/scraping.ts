import { Page } from "puppeteer";
import { Price } from "src/model/prise";
const cheerio = require('cheerio');

export class Scraping{
    constructor(){
        console.log('new Scraping')
    }

    async startScraping(url: string, page: any): Promise<Price>  {

        let totalPrice: Price = {
            name: '',
            price: 0,
            persent: 0, 
            cashback: 0
        }

        try{
            // const agent = userAgent.random().toString()
            // await page.setUserAgent(agent)

            const navigationPromise = page.waitForNavigation({waitUntil: ["load"]});
            const selector = page.waitForSelector('h1') 

            await page.goto(url, {
                waitUntil: ['load'],
                timeout: 60000,
                //referer: ''
            })
            
            await navigationPromise; 
            await selector; 

            // const element = await page.evaluate(() => {
            //     // executed in the browser
            //     return document.querySelector(".sales-block-offer-price__price-final");
            //   }); 
            // console.log("element" + element.nodeValue);

            const content = await page.content(); 
            console.log('content ' + content)
            const CL = await cheerio.load(content);
         
             // Получаем ошибку
            //  CL('.support').slice(0, 1).each((idx, elem) => { 
            //     const errorTitle = CL(elem).text().trim();
            //     if(errorTitle !== ''){
            //         console.log('err ' + errorTitle.trim())
            //         return
            //     }
                    
            //     //const priseBad = priceTitle.trim().replaceAll(' ', '').replaceAll('₽', '')
            //     //totalPrice.price = Number(priseBad)
            // })

            // Получаем цену
            CL('.sales-block-offer-price__price-final').slice(0, 1).each((idx, elem) => { 
                const priceTitle = CL(elem).text();
                const priseBad = priceTitle.trim().replaceAll(' ', '').replaceAll('₽', '')
                totalPrice.price = Number(priseBad)
            })
        
            // Получаем процент кешбека
            CL('.bonus-percent').slice(0, 1).each((idx, elem) => { 
                const persentTitle = CL(elem).text();
                console.log("persentTitle" + persentTitle) 
                const persentBad = persentTitle.trim().replaceAll(' ', '').replaceAll('%', '')
                totalPrice.persent = Number(persentBad)
            })
        
            // Получаем размер кешбека
            CL('.bonus-amount').slice(0, 1).each((idx, elem) => { 
                const cashbackTitle = CL(elem).text();
                const cashbackBad = cashbackTitle.trim().replaceAll(' ', '').replaceAll('₽', '')
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





