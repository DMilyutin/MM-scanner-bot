import puppeteer from "puppeteer-extra"
import KnownDevices from 'puppeteer-extra';
import { Scraping } from "./scraping";
import UserAgent = require("user-agents")

const proxy = '45.8.211.64:80' 
let mmReferer = 'https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwiWo_TFlreEAxWBQVUIHa1tA48QFnoECAgQAQ&url=https%3A%2F%2Fmegamarket.ru%2F&usg=AOvVaw3PYyPKPT8uFHymNEQ_Z0YX&opi=89978449'

export class TestScraping{

    async testProduct(productUrl: string){

        const StealthPlugin = require('puppeteer-extra-plugin-stealth')
        puppeteer.use(StealthPlugin({
            enabledEvasions: new Set(["chrome.app", "chrome.csi", "defaultArgs", "navigator.plugins"])
        }))
        

        const browser = await puppeteer.launch({
            // ПРОМ настройки
            //headless: 'new',
            //defaultViewport: null, 

            // Тестовые настройки
            headless: false,
            //args: ['--proxy-server=socks5://127.0.0.1:9050', '--disable-gpu', '--no-zygote', ] , `--proxy-server=socks5://${proxy}`
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });


        const page = await browser.newPage(); 
        const userAgent = new UserAgent({ deviceCategory: 'desktop' })
        await page.setUserAgent(userAgent.toString())  

        const scraping = new Scraping()

        try{
            await page.goto(mmReferer, {
                waitUntil: ['load'],
                timeout: 60000,
                referer: mmReferer
            })

            //await page.waitForSelector('h1') ;  

            mmReferer = page.url()
            let res = await scraping.startScraping(productUrl, page, mmReferer)
            console.log('----------------------------------------- res 1')
            console.log(`Результат анализа страницы: Название${res.name}, цена: ${res.price}, кэшбек ${res.cashback} (${res.persent}%)`)
            mmReferer = res.referer

            let productUrl2 = 'https://megamarket.ru/catalog/details/nabor-bokalov-crystalite-bohemia-anser-alizee-dlya-vina-770-ml-2-sht-100064192433/'
            let res2 = await scraping.startScraping(productUrl2, page, mmReferer)
            console.log('----------------------------------------- res 2')
            console.log(`Результат анализа страницы: Название${res2.name}, цена: ${res2.price}, кэшбек ${res2.cashback} (${res2.persent}%)`) 
        }catch(e){
            console.log(e) 
        } 
    }
}