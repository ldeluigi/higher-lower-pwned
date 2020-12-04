import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

function rollNumber(end: number,
  time: number,
  update: (n: number) => void,
  start?: number,
  onEnd: () => void = () => { },
  frames: number = 100): Subscription {
  if (start === undefined) {
    start = 0;
  }
  const range = end - start;
  const delta = Math.floor(range / frames);
  const deltaT = Math.floor(time / frames);

  const timer$ = interval(deltaT);
  const numberSubscription = timer$.subscribe(tic => {
    start = start ? start : 0;
    const newValue = start + delta * tic;
    update(newValue);
    if (newValue >= end) {
      update(end);
      numberSubscription?.unsubscribe();
      onEnd();
    }
  });
  return numberSubscription;
}

function charRoll(char: string, step: number, maxStep: number, position: number = 0): { s: string, n: number } {
  const variation = ' '.charCodeAt(0);
  const val = char.charCodeAt(position);
  return step >= maxStep
    ? { s: char, n: val }
    : { s: String.fromCharCode(step * (val - variation) / maxStep + variation), n: step * (val - variation) / maxStep + variation };
}

function rollWord(word: string, time: number, update: (s: string) => void, onEnd: () => void = () => { }): Subscription {
  const frame = 50;
  const deltaT = Math.floor(time / frame);

  const timer$ = interval(deltaT);
  const numberSubscription = timer$.subscribe(tic => {
    const newValue = word.split('').map((e, i) => charRoll(e, tic + i, frame).s).join('');
    update(newValue);
    if (tic > frame) {
      update(word);
      numberSubscription?.unsubscribe();
      onEnd();
    }
  });
  return numberSubscription;
}

function slowDigitWord(word: string, time: number, update: (s: string) => void): Subscription {
  const frame = word.length;
  const deltaT = Math.floor(time / frame);

  const timer$ = interval(deltaT);
  return timer$.pipe(take(frame + 1)).subscribe(tic => {
    const newValue = word.substr(0, tic);
    update(newValue);
    if (tic > frame) {
      update(word);
    }
  });
}

export {
  rollNumber,
  rollWord,
  slowDigitWord
};
