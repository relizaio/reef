import { CronJob } from 'cron'

const autoDestroy = new CronJob(
	'* * * * * *', // cronTime
	function () {
		console.log('You will see this message every second');
	}, // onTick
	null, // onComplete
	false, // start
	'America/Los_Angeles' // timeZone
)

export default {
    autoDestroy
}