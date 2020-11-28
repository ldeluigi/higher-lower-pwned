import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from '@angular/animations';

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

const DURATION3 = '0.3s';
export const cardAnimation: AnimationTriggerMetadata = trigger('cardAnimation', [
  state('void', style({
    opacity: 0,
  })),
  transition('void => second', [
    style({
      opacity: 0,
      transform: 'translateY(0%)'
    }),
    animate(DURATION3, style({
      opacity: 1,
      transform: 'translateY(-110%)'
    }))
  ]),
  transition('first => second', [
    style({
      opacity: -1000,
      transform: 'translateY(-110%)'
    }),
    animate('0.0001ms', style({
      opacity: 0,
      transform: 'translateY(-220%)'
    })),
    animate('0.0001ms', style({
      opacity: 0,
      transform: 'translateY(200%)'
    })
    ),
    animate(DURATION3 + ' ' + '0.2s', style({
      opacity: 1,
      transform: 'translateY(20%)'
    }))
  ]),
  transition('* => start2', [
    style({
      opacity: 0,
      transform: 'translateY(200%)'
    }),
    animate(DURATION3, style({
      opacity: 1,
      transform: 'translateY(0)'
    }))
  ]),
  transition('second => first, start2 => first', [
    style({
    }),
    animate(DURATION3, style({
      transform: 'translateY(-110%)',
    }))
  ]),
  transition('first => out, start1 => out', [
    style({
      opacity: 1,
      transform: 'translateY(0)'
    }),
    animate(DURATION3, style({
      opacity: 1,
      transform: 'translateY(-120%)',
    }))
  ]),
  transition('out => first', [
    style({
      opacity: 1,
    }),
  ]),
  transition('out => void', [
    style({
      opacity: 0,
      transform: 'translate(0, 0)'
    }),
    animate(DURATION3, style({
      opacity: 1,
      transform: 'translate(-110%, 110%)'
    }))
  ]),
  transition('void => first', [
    style({
      opacity: 0,
      transform: 'translateY(110%)'
    }),
    animate(DURATION3, style({
      opacity: 1,
      transform: 'translateY(0)'
    }))
  ]),
  transition('* => start1', [
    style({
      opacity: 0,
      transform: 'translateY(-200%)'
    }),
    animate(DURATION3, style({
      opacity: 1,
      transform: 'translateY(0)'
    }))
  ]),
]);
