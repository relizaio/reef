import { Injectable } from '@nestjs/common'
import { CronJob } from 'cron'

@Injectable()
export class CronService {
    autoDestroy () {
        return new CronJob(
            '* * * * * *', // cronTime
            function () {
                console.log('You will see this message every second');
            }, // onTick
            null, // onComplete
            false, // start
            'America/Los_Angeles' // timeZone
        )
    }
}