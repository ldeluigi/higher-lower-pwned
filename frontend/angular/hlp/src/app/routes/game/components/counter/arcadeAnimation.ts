import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';

const winStyle = style({
  transform: 'translateY(30vh) scale(1.1)',
  position: 'relative',
  'z-index': '100',
  'background-color': 'white',
  width: 'max-content'
});

const loseStyle = style({
  transform: 'translateY(30vh) scale(1.1)',
  position: 'relative',
  'z-index': '100',
  'background-color': 'grey',
  width: 'max-content'
});

const DURATION1 = '2.0s';
export const endGameAnimation: AnimationTriggerMetadata = trigger('endGameAnimation', [
  state('none', style({})),
  state('win', winStyle),
  state('lose', loseStyle),
  transition('none => win', [
    style({
      position: 'relative',
    }),
    animate(DURATION1, winStyle)
  ]),
  transition('none => lose', [
    style({
      position: 'relative',
    }),
    animate(DURATION1, loseStyle)
  ]),
]);
