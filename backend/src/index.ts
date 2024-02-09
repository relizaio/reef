import initialize from './api/initialize'
import cron from './services/cron'

// add timestamps in front of log messages
require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss.l')

initialize.startup()

// cron.autoDestroy.start()