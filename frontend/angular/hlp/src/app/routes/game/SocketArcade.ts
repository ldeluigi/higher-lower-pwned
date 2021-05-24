import { Socket } from 'ngx-socket-io';

export class SocketArcade extends Socket {
  constructor(
    private url: string,
    private token: string | undefined
  ) {
    super({ url: `${url}/arcade`, options: {
      autoConnect: false,
      reconnectionAttempts: 3,
      timeout: 1000,
      auth: {token: token} }
    });
  }
}
