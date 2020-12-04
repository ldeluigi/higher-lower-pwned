import { Observable, Subscription } from 'rxjs';
import { ComponentPart } from '../../utils/GameComponentPart';

export interface Counter extends ComponentPart {
  setUp(mode: string, name: string): void;

  updateScore(score: number): Subscription;

  endGameAnimation(type?: string): Subscription;

  clear(): void;
}
