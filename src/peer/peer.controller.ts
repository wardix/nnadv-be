import { Controller, Post, Body } from '@nestjs/common';
import { PeerService } from './peer.service';

@Controller('peer')
export class PeerController {
  constructor(private readonly peerService: PeerService) {}
}
