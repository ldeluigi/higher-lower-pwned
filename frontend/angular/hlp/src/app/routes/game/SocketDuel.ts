import { Socket } from 'ngx-socket-io';

export class SocketDuel extends Socket {
  constructor(
    private url: string,
    private token: string | undefined
  ) {
    super({ url: `${url}/duel`, options: {
      autoConnect: false,
      reconnectionAttempts: 3,
      timeout: 1000,
      auth: {token: token} }
    });
  }
}
