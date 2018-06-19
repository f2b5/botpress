/**
 * @typedef {Function} Logger~MessageLogger
 * @param {String} message Message to log
 * @param {...Object} objects Additional objects to log
 */

/**
 * @class Logger
 * @prop {Logger~MessageLogger} debug Logs message for debugging purposes
 * (hidden in production by default, see {@link Botfile} to change this)
 * @prop {Logger~MessageLogger} info Logs informative messages (shown in production)
 * @prop {Logger~MessageLogger} warn Logs warning messages (shown in production)
 * @prop {Logger~MessageLogger} error Logs error messages (shown in production)
 */

import { createLogger, format, transports } from 'winston'
const { combine, timestamp, colorize, prettyPrint, printf } = format
import path from 'path'
import Promise from 'bluebird'
import moment from 'moment'

import { isDeveloping } from '../util'
import DbTransport from './db-transport'
import { SPLAT } from 'triple-beam'

module.exports = (dataLocation, logConfig) => {
  const logger = createLogger({
    level: isDeveloping ? 'debug' : 'info',
    format: combine(
      colorize(),
      timestamp({ format: () => moment().format('HH:mm:ss') }),
      prettyPrint(),
      printf(info => {
        let rest = info[SPLAT]
        if (Array.isArray(rest)) {
          rest = rest.join(' ')
        } else {
          rest = rest ? JSON.stringify(rest) : null
        }
        return `${info.timestamp} ${info.level}: ${info.message}${rest ? ' ' + rest : ''}`
      })
    ),
    transports: [new transports.Console()]
  })

  if (logConfig.enabled) {
    logger.add(
      new DbTransport({
        ttl: logConfig.keepDays * 24 * 3600
      })
    )
  }

  logger.archiveToFile = () => {
    const logFile = path.join(dataLocation, logConfig.file)

    return Promise.resolve(logFile)
  }

  return logger
}
