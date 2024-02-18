import { Injectable  } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScrapingService } from '../scraping/scraping.service';

@Injectable()
export class CronService {
  constructor(
    private readonly scrapingService: ScrapingService
  ){}
  

  @Cron(CronExpression.EVERY_HOUR)
  //@Cron('10 * * * * *')
  async handleCron() { 
    console.log('Called every 10 seconds') 
    await this.scrapingService.updateProduct()
  }
}