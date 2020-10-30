import { Socket } from 'ngx-socket-io';

export class SocketDuel extends Socket {
  constructor(
    private url: string
  ) {
    super({ url: `${url}/duel`, options: { autoConnect: false } });
  }
}
