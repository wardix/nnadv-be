import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PeerService } from './peer.service';
import { PeerController } from './peer.controller';

@Module({
  imports: [ConfigModule],
  controllers: [PeerController],
  providers: [PeerService],
  exports: [PeerService],
})
export class PeerModule {}
