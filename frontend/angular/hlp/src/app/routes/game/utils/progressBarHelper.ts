import { interval, Subscription } from 'rxjs';

export class ProgressBarHelper {

  private initialValue: number | undefined;
  private progressBarMax = 0;
  progressbarValue = 100;
  timeLeft = 0;
  protected subTimer: Subscription | undefined;

  constructor(maxValue: number | undefined) {
    this.initialValue = maxValue;
    if (this.initialValue) {
      this.progressBarMax = this.initialValue;
    }
  }

  protected resetProgressBarValue(): void {
    if (this.initialValue) {
      this.progressBarMax = this.initialValue;
    } else {
      this.progressBarMax = 0;
    }
  }

  protected async setProgressBarTimer(milliseconds: number): Promise<void> {
    if (this.initialValue === undefined) {
      this.progressBarMax = Math.max(milliseconds, this.progressBarMax);
    }

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
