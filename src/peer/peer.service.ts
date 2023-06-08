import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import * as yaml from 'js-yaml';
import * as fs from 'fs';

@Injectable()
export class PeerService {
  private readonly logger = new Logger()

  constructor(private readonly configService: ConfigService) {}

  async advertise(user: string, upstream: string[], advertisement: any) {
    const configFile =
      this.configService.get('DATA_DIRECTORY') +
      '/' +
      this.configService.get('CONFIG_FILE');
    const data = yaml.dump({ upstream, advertisement });
    const date = new Date();
    const now = this.getJakartaFormatedTime(date);
    const timeStamp = Math.floor(date.getTime() / 1000);
    const configHeader = [
      `## ${this.configService.get('CONFIG_PREAMBULE')}`,
      `## ${this.configService.get('DOC_URL')}`,
      `## ${now} ${user}`,
      '',
    ];

    const content = configHeader.join('\n') + data;
    const configFileHistory = `${configFile}-${timeStamp}`;

    this.logger.warn(`advertise: user=${user}`)
    fs.writeFileSync(configFile, content, 'utf8');
    fs.writeFileSync(configFileHistory, content, 'utf8');
    exec(this.configService.get('ADVERTISEMENT_POST_EXEC'));

    return 'OK';
  }

  async disablePeer(user: string, peer: string) {
    this.logger.warn(`disable peer: peer=${peer} user=${user}`)
    exec(`${this.configService.get('DISABLE_PEER_COMMAND')} ${peer}`);

    return 'OK';
  }

  async enablePeer(user: string, peer: string) {
    this.logger.warn(`enable peer: peer=${peer} user=${user}`)
    exec(`${this.configService.get('ENABLE_PEER_COMMAND')} ${peer}`);

    return 'OK';
  }

  getJakartaFormatedTime(datetime: Date) {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const [date, time] = formatter.format(datetime).split(', ');
    const [mm, dd, yyyy] = date.split('/');
    return `${yyyy}-${mm}-${dd} ${time}`;
  }
}
