import { interval, Subscription} from 'rxjs';

export default class Utils {
  static rollNumber(end: number, time: number, update: (n: number) => void, frames: number = 100): Promise<void> {
    const delta = Math.floor(end / frames);
    const deltaT = Math.floor(time / frames);

    const timer$ = interval(deltaT);
    return new Promise<void>(resolve => {
      const numberSubscription = timer$.subscribe(tic => {
        const newValue = delta * tic;
        update(newValue);
        if (newValue >= end) {
          update(end);
          numberSubscription?.unsubscribe();
          resolve();
        }
      });
    });
  }

  static charRoll(char: string, step: number, maxStep: number, position: number = 0): {s: string, n: number} {
      const variation = ' '.charCodeAt(0);
      const val = char.charCodeAt(position);
      return step >= maxStep
        ? {s: char, n: val}
        : {s: String.fromCharCode(step * (val - variation) / maxStep + variation), n: step * (val - variation) / maxStep + variation};
  }

  static rollWord(word: string, time: number, update: (s: string) => void, frames: number = 100): Promise<void> {
    const frame = 50;
    const deltaT = Math.floor(time / frame);

    const timer$ = interval(deltaT);
    return new Promise<void>(resolve => {
      const numberSubscription = timer$.subscribe(tic => {
        const newValue = word.split('').map((e, i) => this.charRoll(e, tic + i, frame).s).join('');
        update(newValue);
        if (tic > frame) {
          update(word);
          numberSubscription?.unsubscribe();
          resolve();
        }
      });
    });
  }
}



