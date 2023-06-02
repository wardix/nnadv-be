import { Controller, Post, Body } from '@nestjs/common';
import { PeerService } from './peer.service';

@Controller('peer')
export class PeerController {
  constructor(private readonly peerService: PeerService) {}

  @Post('advertisement')
  async advertise(@Body() { user, upstream, advertisement }) {
    return this.peerService.advertise(user, upstream, advertisement);
  }

  @Post('down')
  async disablePeer(@Body() { user, peer }) {
    return this.peerService.disablePeer(user, peer);
  }

  @Post('up')
  async enablePeer(@Body() { user, peer }) {
    return this.peerService.enablePeer(user, peer);
  }
}
