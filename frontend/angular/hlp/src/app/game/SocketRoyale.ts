import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

@Injectable()
export class SocketRoyale extends Socket {
  constructor() {
    super({ url: `${environment.apiUrl}/royale`, options: { autoConnect: false } });
  }
}
