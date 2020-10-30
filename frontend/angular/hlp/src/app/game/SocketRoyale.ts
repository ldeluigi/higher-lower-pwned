import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { ApiURLService } from '../_services/api-url.service';

@Injectable()
export class SocketRoyale extends Socket {
  constructor(
    private url: ApiURLService
  ) {
    super({ url: `${url.socketApiUrl}/royale`, options: { autoConnect: false } });
  }
}
