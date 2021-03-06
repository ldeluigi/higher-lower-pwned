import { animate, AnimationTriggerMetadata, style, transition, trigger } from '@angular/animations';

const DURATION1 = '1.0s';
export const vsAnimation: AnimationTriggerMetadata = trigger('vsAnimation', [
  transition('true <=> false', [
    style({
      transform: 'rotate(0deg)'
    }),
    animate(DURATION1, style({
      transform: 'rotate(360deg)'
    }))
  ]),
]);
