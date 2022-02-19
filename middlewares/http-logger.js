
const {createLogger, format, transports, exceptions } = require('winston')
const expressWinston = require('express-winston')

const LOG_LEVEL = process.env.HTTP_LOG_LEVEL || process.env.LOG_LEVEL || 'info'

const consoleLogger = createLogger({
  level: LOG_LEVEL,
  stderrLevels: ['warn', 'error'],
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [new transports.Console()]
})

const dynamicMetaParser = (req, res) => ({
  res: { statusCode: res.statusCode, responseTime: res.responseTime },
  ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
  userId: req.userId ? req.userId : req.user && req.user._id.toString()
})

const loggerMiddleware = expressWinston.logger({
    winstonInstance: consoleLogger,
    meta: true,
    msg: 'HTTPS {{req.method}} {{req.url}} correlation-id:{{req.correlationId}} operator-identifier: {{req.operator}} - {{res.statusCode}} {{res.responseTime}}ms',
    expressFormat: false,
    colorize: false,
    dynamicMeta: dynamicMetaParser,
    ignoredRoutes: ['/health']
  })

  const errorLoggerMiddleware = expressWinston.errorLogger({
    winstonInstance: consoleLogger,
    level: (req, res, err) => err.isServer ? 'error' : 'warn',
    exceptionToMeta: (err) => err.isServer ? exceptions.getAllInfo(err) : {},
    dynamicMeta: dynamicMetaParser,
    msg: '{{err.message}} {{res.statusCode}} - {{req.method}} {{req.url}} correlation-id:{{req.correlationId}} - operator-identifier: {{req.operator}}'
  })
  
  module.exports = {
    loggerMiddleware,
    errorLoggerMiddleware
  }
  