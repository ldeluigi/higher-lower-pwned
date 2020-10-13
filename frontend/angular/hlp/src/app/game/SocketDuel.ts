import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';


@Injectable()
export class SocketDuel extends Socket {
  constructor() {
    super({ url: `${environment.apiUrl}/duel`, options: { autoConnect: false } });
  }
}
