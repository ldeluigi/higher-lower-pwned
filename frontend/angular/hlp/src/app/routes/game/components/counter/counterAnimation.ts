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

const duelWinStyle = style ({
  position: 'relative',
  transform: 'translateY(30vh) scale(1.1)',
  'background-color': 'white',
  'z-index': '100',
  margin: 'auto',
  width: 'max-content'
});

const duelLoseStyle = style ({
  'background-color': 'grey'
});

const DURATION1 = '2.0s';
export const endGameAnimation: AnimationTriggerMetadata = trigger('endGameAnimation', [
  // ARCADE
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

  // DUEL
  state('duelWin', duelWinStyle),
  state('duelLose', duelLoseStyle),
  transition('none => duelWin', [
    style({
      position: 'relative',
    }),
    animate(DURATION1, duelWinStyle)
  ]),
  transition('none => duelLose', [
    animate(DURATION1, duelLoseStyle)
  ]),
]);
