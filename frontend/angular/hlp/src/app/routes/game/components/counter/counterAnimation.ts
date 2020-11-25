import { animate, AnimationTriggerMetadata, query, state, style, transition, trigger } from '@angular/animations';

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
  width: 'max-content',
  'background-color': 'grey',
});

/** case current player wins */
const duelUserWinStyle = style({
  position: 'relative',
  // left: '50%',
  transform: 'scale(1.2)',
  'z-index': '100',
  'background-color': 'white',
  width: 'max-content',
});

const duelOppLoseStyle = style({
  position: 'relative',
  // top: '50%',
  // left: '50%',
  transform: 'scale(0.8)',
  'z-index': '90',
  'background-color': 'grey',
  width: 'max-content',
});

/** case other player wins */
const duelUserLoseStyle = style({
  position: 'relative',
  // top: '50%',
  // left: '50%',
  transform: 'scale(0.8)',
  'z-index': '90',
  'background-color': 'grey',
  width: 'max-content',
});

const duelOppWinStyle = style({
  position: 'relative',
  // top: '50%',
  // left: '50%',
  transform: 'scale(1.2)',
  'z-index': '100',
  'background-color': 'white',
  width: 'max-content',
});

const drawStyle = style({
  position: 'relative',
  // top: '50%',
  // left: '50%',
  transform: 'scale(0.9)',
  'z-index': '100',
  'background-color': 'grey',
  width: 'max-content',
});


const DURATION = '2.0s';
export const endGameAnimation: AnimationTriggerMetadata = trigger('endGameAnimation', [
  // ARCADE
  state('none', style({})),
  state('win', winStyle),
  state('lose', loseStyle),
  transition('none => win', [
      style({
        position: 'relative',
      }),
      animate(DURATION, winStyle)
  ]),
  transition('none => lose', [
      style({
        position: 'relative',
      }),
      animate(DURATION, loseStyle)
  ]),

  // DUEL
  state('duelUserWin', duelUserWinStyle),
  state('duelOppWin', duelOppWinStyle),
  state('duelUserLose', duelUserLoseStyle),
  state('duelOppLose', duelOppLoseStyle),
  state('draw', drawStyle),
  transition('none => duelUserWin', [
    style({
      position: 'relative',
    }),
    animate(DURATION, duelUserWinStyle)
  ]),
  transition('none => duelOppWin', [
    style({
      position: 'relative',
    }),
    animate(DURATION, duelOppWinStyle)
  ]),
  transition('none => duelUserLose', [
    style({
      position: 'relative',
    }),
    animate(DURATION, duelUserLoseStyle)
  ]),
  transition('none => duelOppLose', [
    style({
      position: 'relative',
    }),
    animate(DURATION, duelOppLoseStyle)
  ]),
  transition('none => draw', [
    style({
      position: 'relative',
    }),
    animate(DURATION, drawStyle)
  ]),
]);
