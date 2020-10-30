import { Socket } from 'ngx-socket-io';

export class SocketArcade extends Socket {
  constructor(
    private url: string
  ) {
    super({ url: `${url}/arcade`, options: {
      autoConnect: false,
      reconnectionAttempts: 10,
      timeout: 1000 }
    });
  }
}
