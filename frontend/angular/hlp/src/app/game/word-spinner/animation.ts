import { trigger, state, style, animate, transition, AnimationEvent, AnimationTriggerMetadata } from '@angular/animations';


export function vsAnimation(): AnimationTriggerMetadata {
  const DURATION = '1.6s';
  return trigger('vsAnimation', [
    transition('true <=> false', [
      style({
        transform: 'rotate(0deg)'
      }),
      animate(DURATION, style({
        transform: 'rotate(360deg)'
      }))
    ]),
  ]);
}


export function wordAnimation(): AnimationTriggerMetadata {
  const DURATION = '0.8s';
  return trigger('wordAnimation', [

    transition('void => second', [
      style({
        opacity: 0,
        transform: 'translateY(0%)'
      }),
      animate(DURATION, style({
        opacity: 1,
        transform: 'translateY(-400%)'
      }))
    ]),
    transition('* => start2', [
      style({
        opacity: 0,
        transform: 'translateY(200%)'
      }),
      animate(DURATION, style({
        opacity: 0.9,
        transform: 'translateY(0)'
      }))
    ]),
    transition('second => first, start2 => first', [
      animate(DURATION, style({
        transform: 'translateY(-400%)',
      }))
    ]),
    transition('first => out, start1 => out', [
      style({
        opacity: 1,
        transform: 'translateY(0)'
      }),
      animate(DURATION, style({
        opacity: 0.2,
        transform: 'translateY(-400%)',
      }))
    ]),
    transition('out => void', [
      style({
        opacity: 0,
        transform: 'translate(0, 0)'
      }),
      animate(DURATION, style({
        opacity: 1,
        transform: 'translate(-400%, 400%)'
      }))
    ]),
    transition('void => first', [
      style({
        opacity: 0,
        transform: 'translateY(400%)'
      }),
      animate(DURATION, style({
        opacity: 1,
        transform: 'translateY(0)'
      }))
    ]),
    transition('* => start1', [
      style({
        opacity: 0,
        transform: 'translateY(-200%)'
      }),
      animate(DURATION, style({
        opacity: 1,
        transform: 'translateY(0)'
      }))
    ]),
  ]);
}

export function cardAnimation(): AnimationTriggerMetadata {
  const DURATION = '0.8s';
  const firstBackgroun = 'red';
  const secondBackgroun = 'lightblue';
  return trigger('cardAnimation', [
    state('void', style( {
      opacity: 0,
    })),
    transition('void => second', [
      style({
        opacity: 0,
        transform: 'translateY(0%)'
      }),
      animate(DURATION, style({
        opacity: 1,
        transform: 'translateY(-110%)'
      }))
    ]),
    transition('* => second', [
      animate(DURATION, style({
        'background-color': secondBackgroun
      })),
    ]),
    transition('* => start2', [
      style({
        opacity: 0,
        transform: 'translateY(200%)'
      }),
      animate(DURATION, style({
        opacity: 0.9,
        transform: 'translateY(0)'
      }))
    ]),
    transition('second => first, start2 => first', [
      style({
        'background-color': secondBackgroun
      }),
      animate(DURATION, style({
        'background-color': firstBackgroun,
        transform: 'translateY(-110%)',
      }))
    ]),
    transition('first => out, start1 => out', [
      style({
        opacity: 1,
        transform: 'translateY(0)'
      }),
      animate(DURATION, style({
        opacity: 0,
        transform: 'translateY(-110%)',
      }))
    ]),
    transition('out => void', [
      style({
        opacity: 0,
        transform: 'translate(0, 0)'
      }),
      animate(DURATION, style({
        opacity: 1,
        transform: 'translate(-110%, 110%)'
      }))
    ]),
    transition('void => first', [
      style({
        opacity: 0,
        transform: 'translateY(110%)'
      }),
      animate(DURATION, style({
        opacity: 1,
        transform: 'translateY(0)'
      }))
    ]),
    transition('* => start1', [
      style({
        opacity: 0,
        transform: 'translateY(-200%)'
      }),
      animate(DURATION, style({
        opacity: 1,
        transform: 'translateY(0)'
      }))
    ]),
  ]);
}
