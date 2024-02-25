import { Price } from "src/model/prise";
import cheerio from 'cheerio';

export class Scraping{

    async startScraping(url: string, page: any, mmReferer: string): Promise<Price>  {

        let totalPrice: Price = {
            name: '',
            price: 0,
            persent: 0, 
            cashback: 0,
            referer: ''
        }

        try{

            await page.goto(url, {
                waitUntil: 'networkidle0',
                timeout: 60000,
                referer: mmReferer,
            })

            // await page.waitForNavigation({waitUntil: ["load"]});
            await page.waitForSelector('h1', {timeout: 90000, visible: true}) ;
            // const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
            // await sleep(15000)
            totalPrice.referer = page.url();

            const content = await page.content(); 
            //console.log('content ' + content)
            const CL = cheerio.load(content); 
            
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





