import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class GameSocketService {

  constructor(
    private socket: Socket
  ) { }

  getUser(id: string) {
    this.socket.emit('io.connection', id);
  }
}
