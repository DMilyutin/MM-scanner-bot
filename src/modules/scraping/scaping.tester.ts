const puppeteer = require('puppeteer-extra')
import {KnownDevices} from 'puppeteer';
const iPhone = KnownDevices['iPhone 13'];
import { Scraping } from "./scraping";

export class TestScraping{

    async testProduct(productUrl: string){

        const StealthPlugin = require('puppeteer-extra-plugin-stealth')
        puppeteer.use(StealthPlugin())

        const browser = await puppeteer.launch({
            //executablePath: '/usr/bin/chromium-browser',
            headless: 'new',
            //args: ['--proxy-server=socks5://127.0.0.1:9050', '--disable-gpu', '--no-zygote', ]
            defaultViewport: null, 
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });


        const page = await browser.newPage(); 
        const scraping = new Scraping()

        try{
            await page.emulate(iPhone);
            let res = await scraping.startScraping(productUrl, page)
            console.log('----------------------------------------- res 1')
            console.log(`Результат анализа страницы: Название${res.name}, цена: ${res.price}, кэшбек ${res.cashback} (${res.persent}%)`)

            // let res2 = await scraping.startScraping(productUrl, page)
            // console.log('----------------------------------------- res 2')
            // console.log(`Результат анализа страницы: Название${res2.name}, цена: ${res2.price}, кэшбек ${res2.cashback} (${res2.persent}%)`) 
        }catch(e){
            console.log(e)
        } 
    }
}