import initialize from './api/initialize'

// add timestamps in front of log messages
require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss.l')

initialize.startup()