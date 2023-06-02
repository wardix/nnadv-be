import { LoggerOptions, transports, format } from 'winston';

const winstonConfig: LoggerOptions = {
  transports: [
    new transports.File({
      filename: process.env.LOG_FILE || 'logs/nnadv.log',
      level: process.env.LOG_LEVEL || 'info',
      format: format.simple()
    })
  ],
};

export default winstonConfig
