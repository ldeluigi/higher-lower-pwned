import { Socket } from 'ngx-socket-io';

export class SocketRoyale extends Socket {
  constructor(
    private url: string
  ) {
    super({ url: `${url}/royale`, options: {
      autoConnect: false,
      reconnectionAttempts: 3,
      timeout: 1000 }
    });
  }
}
