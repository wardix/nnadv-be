import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PeerModule } from './peer/peer.module';

@Module({
  imports: [ConfigModule.forRoot(), PeerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
