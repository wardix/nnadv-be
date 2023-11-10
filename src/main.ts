import Fastify, { FastifyInstance } from 'fastify'
import { config } from 'dotenv'
import { exec } from 'child_process'
import { Syslog } from 'winston-syslog'
import winston from 'winston'
import * as fs from 'fs'
import * as yaml from 'js-yaml'

config()

const PORT = process.env.PORT! || 3000
const APP_NAME = process.env.APP_NAME!
const DATA_DIRECTORY = process.env.DATA_DIRECTORY!
const CONFIG_FILE = process.env.CONFIG_FILE!
const CONFIG_PREAMBULE = process.env.CONFIG_PREAMBULE!
const DOC_URL = process.env.DOC_URL!
const ADVERTISEMENT_POST_EXEC = process.env.ADVERTISEMENT_POST_EXEC!
const DISABLE_PEER_COMMAND = process.env.DISABLE_PEER_COMMAND!
const ENABLE_PEER_COMMAND = process.env.ENABLE_PEER_COMMAND!
const API_KEYS = JSON.parse(process.env.API_KEYS!)

const fastify = Fastify({ logger: true })

const syslogTransport = new Syslog({
  app_name: APP_NAME,
})

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: [syslogTransport],
})

const getJakartaFormatedTime = (datetime: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }

  const formatter = new Intl.DateTimeFormat('en-US', options)
  const [date, time] = formatter.format(datetime).split(', ')
  const [mm, dd, yyyy] = date.split('/')
  return `${yyyy}-${mm}-${dd} ${time}`
}

const authenticate = async (request: any, reply: any) => {
  const apiKey = request.headers['x-api-key']
  if (!apiKey || !API_KEYS.includes(apiKey)) {
    reply.code(401).send({ error: 'Unauthorized' })
  }
}

fastify.addHook('preHandler', authenticate)

const advertisementRoute = async (fastify: FastifyInstance) => {
  fastify.post('/', async (request: any, reply) => {
    const { user, advertisement } = request.body
    const configFile = DATA_DIRECTORY + '/' + CONFIG_FILE
    const data = yaml.dump({ advertisement })
    const date = new Date()
    const now = getJakartaFormatedTime(date)
    const timeStamp = Math.floor(date.getTime() / 1000)
    const configHeader = [
      `## ${CONFIG_PREAMBULE}`,
      `## ${DOC_URL}`,
      `## ${now} ${user}`,
      '',
    ]

    const content = configHeader.join('\n') + data
    const configFileHistory = `${configFile}-${timeStamp}`

    fs.writeFileSync(configFile, content, 'utf8')
    fs.writeFileSync(configFileHistory, content, 'utf8')
    exec(ADVERTISEMENT_POST_EXEC)
    reply.send({ message: 'OK' })
  })
}

const downRoute = async (fastify: FastifyInstance) => {
  fastify.post('/', async (request: any, reply) => {
    const { user, peer } = request.body
    logger.info(`user: ${user}, action: disablePeer, peer: ${peer}`)
    exec(`${DISABLE_PEER_COMMAND} ${peer}`)
    reply.send({ message: 'OK' })
  })
}

const upRoute = async (fastify: FastifyInstance) => {
  fastify.post('/', async (request: any, reply) => {
    const { user, peer } = request.body
    logger.info(`user: ${user}, action: enablePeer, peer: ${peer}`)
    exec(`${ENABLE_PEER_COMMAND} ${peer}`)
    reply.send({ message: 'OK' })
  })
}

fastify.register(advertisementRoute, { prefix: '/bgp-peer/advertisement' })
fastify.register(downRoute, { prefix: '/bgp-peer/down' })
fastify.register(upRoute, { prefix: '/bgp-peer/up' })

fastify.listen({ port: +PORT, host: '0.0.0.0' }, (err) => {
  if (err) throw err
})
