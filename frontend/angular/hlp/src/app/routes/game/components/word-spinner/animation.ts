import { trigger, state, style, animate, transition, AnimationEvent, AnimationTriggerMetadata } from '@angular/animations';

const DURATION1 = '1.0s';
export const vsAnimation: AnimationTriggerMetadata = trigger('vsAnimation', [
  transition('true <=> false', [
    style({
      transform: 'translateY(var(--translateY)) rotate(0deg)'
    }),
    animate(DURATION1, style({
      transform: 'translateY(var(--translateY)) rotate(360deg)'
    }))
  ]),
]);


const DURATION2 = '4.5s';
export const wordAnimation: AnimationTriggerMetadata = trigger('wordAnimation', [

  transition('void => second', [
    style({
      opacity: 0,
      transform: 'translateY(0%)'
    }),
    animate(DURATION2, style({
      opacity: 1,
      transform: 'translateY(-400%)'
    }))
  ]),
  transition('* => start2', [
    style({
      opacity: 0,
      transform: 'translateY(200%)'
    }),
    animate(DURATION2, style({
      opacity: 0.9,
      transform: 'translateY(0)'
    }))
  ]),
  transition('second => first, start2 => first', [
    animate(DURATION2, style({
      transform: 'translateY(-400%)',
    }))
  ]),
  transition('first => out, start1 => out', [
    style({
      opacity: 1,
      transform: 'translateY(0)'
    }),
    animate(DURATION2, style({
      opacity: 0.2,
      transform: 'translateY(-400%)',
    }))
  ]),
  transition('out => void', [
    style({
      opacity: 0,
      transform: 'translate(0, 0)'
    }),
    animate(DURATION2, style({
      opacity: 1,
      transform: 'translate(-400%, 400%)'
    }))
  ]),
  transition('void => first', [
    style({
      opacity: 0,
      transform: 'translateY(400%)'
    }),
    animate(DURATION2, style({
      opacity: 1,
      transform: 'translateY(0)'
    }))
  ]),
  transition('* => start1', [
    style({
      opacity: 0,
      transform: 'translateY(-200%)'
    }),
    animate(DURATION2, style({
      opacity: 1,
      transform: 'translateY(0)'
    }))
  ]),
]);

const DURATION3 = '0.3s';
const firstBackground = 'red';
const secondBackground = 'lightblue';
export const cardAnimation: AnimationTriggerMetadata = trigger('cardAnimation', [
  state('void', style({
    opacity: 0,
  })),
  // state('dummy', style({
  //   display: 'none',
  // })),
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
      opacity: 0.9,
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
  // transition('* => dummy0', [
  //   style({
  //     opacity: 1,
  //     transform: 'skew(0deg, 0deg)'
  //   }),
  //   animate(LONG_DURATION, style({
  //   })),
  //   animate(LONG_DURATION, style({
  //     opacity: 0.1,
  //     transform: 'skew(90deg, 90deg)'
  //   })),
  //   animate(LONG_DURATION, style({
  //     display: 'none'
  //   })),
  // ])
]);