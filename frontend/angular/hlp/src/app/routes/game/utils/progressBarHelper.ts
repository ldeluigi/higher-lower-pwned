import { interval, Subscription } from 'rxjs';

export class ProgressBarHelper {

  protected progressBarMax = 0;
  progressbarValue = 100;
  timeLeft = 0;
  protected subTimer: Subscription | undefined;



  protected async setProgressBarTimer(milliseconds: number): Promise<void> {
    this.progressBarMax = Math.max(milliseconds, this.progressBarMax);

    const progressBarMax = milliseconds / this.progressBarMax * 100;
    const frames = 200;
    const delta = progressBarMax / frames;
    const deltaT = Math.floor(milliseconds / frames);
    const timer$ = interval(deltaT);

    this.subTimer?.unsubscribe();

    return new Promise<void>(resolve => {
      this.subTimer = timer$.subscribe((d) => {
        const currentValue = delta * d;
        const currentMillis = deltaT * d;
        this.timeLeft = milliseconds - currentMillis;
        this.progressbarValue = progressBarMax - currentValue;
        if (this.timeLeft <= 0 && this.subTimer) {
          this.subTimer.unsubscribe();
          this.subTimer = undefined;
          this.progressbarValue = 0;
          this.timeLeft = 0;
          resolve();
        }
      });
    });
  }
}
