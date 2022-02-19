const { createLogger, format, transports } = require('winston')
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'

const formatError = ({ isBoom, message, data, output, stack, name, options }) => {
    return { isBoom, message, data, output, stack, name, options }
  }
  
const formatLog = format((info) => {
    
    const splatList = info[Symbol.for('splat')] || []
  
    const extractErrors = (arr, errors = []) => {
      arr.forEach(item => {
        if (item instanceof Error) {
          errors.push(formatError(item))
        } else if (item instanceof Array) {
          errors.push(...extractErrors(item))
        } else if (item instanceof Object) {
          errors.push(item)
        } else {
          errors.push(item)
        }
      })
      return errors
    }
  
    if (splatList.length) {
      return {
        ...info,
        [info.level === 'error' ? 'errors' : 'details']: extractErrors(splatList)
      }
    }
    return {
      ...info
    }
  })
  
  const logger = createLogger({
    level: LOG_LEVEL || 'info',
    stderrLevels: ['error'],
    format: format.combine(
      format.timestamp(),
      formatLog(),
      format.json({})
    ),
    transports: [new transports.Console()]
  })
    
  module.exports = logger