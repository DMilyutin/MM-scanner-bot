import { Injectable  } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScrapingService } from '../scraping/scraping.service';

@Injectable()
export class CronService {
  constructor(
    private readonly scrapingService: ScrapingService
  ){}
  

  @Cron(CronExpression.EVERY_5_MINUTES)
  //@Cron('10 * * * * *')
  async handleCron() { 
    console.log('Старт анализа цен ' + new Date()) 
    await this.scrapingService.updateProduct() 
  }

}