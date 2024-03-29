import puppeteer from "puppeteer-extra"
import { Scraping } from "./scraping";
import UserAgent = require("user-agents")
import { log } from "console";


let mmReferer = 'https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwiWo_TFlreEAxWBQVUIHa1tA48QFnoECAgQAQ&url=https%3A%2F%2Fmegamarket.ru%2F&usg=AOvVaw3PYyPKPT8uFHymNEQ_Z0YX&opi=89978449'
let mmReferer2 = 'https://megamarket.ru' 

export class TestScraping{

    async testProduct(productUrl: string){

        const StealthPlugin = require('puppeteer-extra-plugin-stealth')
        puppeteer.use(StealthPlugin({
            enabledEvasions: new Set(["chrome.app", "chrome.csi", "defaultArgs", "navigator.plugins"])
        }))
        
        const proxy = '95.165.14.53:57751'
        const proxyUsername = '693cab'
        const proxyPassword = '28c5bd'
        const browser = await puppeteer.launch({
            // ПРОМ настройки
            //headless: 'new',
            //defaultViewport: null, 

            // Тестовые настройки 
            headless: false, 
            //args: ['--proxy-server=socks5://127.0.0.1:9050', '--disable-gpu', '--no-zygote', ] , `--proxy-server=socks5://${proxy}`
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                `--proxy-server=${proxy}`, 
                //'--proxy-server=185.130.105.109:10000',   
                //`--proxy-server=${proxy}`,
                //`--proxy-server=socks5://${proxy}`, 
                //`--proxy-server=http://${proxy}`, 
                //'--proxy-server=45.141.197.101:62520',
                //'--proxy-server=socks5://=45.141.197.101:62521',
                '--proxy-auth=693cab:28c5bd' 
            ]
        });

        
        const page = await browser.newPage(); 
        const userAgent = new UserAgent({ deviceCategory: 'desktop' })
        await page.setUserAgent(userAgent.toString()) 
        //await page.setRequestInterception(true)
        

        // page.on('request', async (request) => {
        //     await proxyRequest({
        //         page,
        //         proxyUrl: `http://${proxy}`,
        //         request,
        //       });
        // })

        const scraping = new Scraping() 

        try{
            // const products = ['Продукт 1', 'Продукт 2', 'Продукт 3']
            // const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
            // log('Старт')
            // for (let product of products){
                
            //     log('перед таймаутом')
            //     await sleep(3000)
            //     log(product + ' с таймаутом')  

            //     log('после таймаутом') 

            // }

            // log('Конец')

            // (async function() {
            //     const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
            //     console.log(1)
            //     await sleep(1000)
            //     console.log(2)
            //     })()

            await page.authenticate({username: proxyUsername, password: proxyPassword});
            //await page.authenticate({username:'S6GzezAY', password:'RNW78Fm5'});
            

            // https://whatismyipaddress.com/ru/index
            await page.goto('https://whatismyipaddress.com/ru/index', {  
            //await page.goto(productUrl, {  
                waitUntil: ['load'],
                timeout: 60000,
                referer: mmReferer  
            })


            //await page.waitForSelector('h1') ;   
 
            // mmReferer = page.url()
            // let res = await scraping.startScraping(productUrl, page, mmReferer)
            // console.log('----------------------------------------- res 1')
            // console.log(`Результат анализа страницы: Название${res.name}, цена: ${res.price}, кэшбек ${res.cashback} (${res.persent}%)`)
            // mmReferer = res.referer

            // let productUrl2 = 'https://megamarket.ru/catalog/details/nabor-bokalov-crystalite-bohemia-anser-alizee-dlya-vina-770-ml-2-sht-100064192433/'
            // let res2 = await scraping.startScraping(productUrl2, page, mmReferer)
            // console.log('----------------------------------------- res 2')
            // console.log(`Результат анализа страницы: Название${res2.name}, цена: ${res2.price}, кэшбек ${res2.cashback} (${res2.persent}%)`) 
        }catch(e){
            console.log(e) 
        } 
    }
}
