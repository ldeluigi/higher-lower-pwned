import { animate, AnimationTriggerMetadata, style, transition, trigger } from '@angular/animations';

export function animationTitle1(): AnimationTriggerMetadata {
  return trigger('title1', [
    transition(':enter', [
      style({
        opacity: 0,
        transform: 'translateX(-100%)'
      }),
      animate('0.75s', style({
        opacity: 1,
        transform: 'translateX(0%)'
      }))
    ])
  ]);
}
export function animationTitle2(): AnimationTriggerMetadata {
  return trigger('title2', [
    transition(':enter', [
      style({
        opacity: -0.25,
        transform: 'translateY(-100%)'
      }),
      animate('1.25s', style({
        opacity: 1,
        transform: 'translateY(0%)'
      }))
    ])
  ]);
}
export function animationTitle3(): AnimationTriggerMetadata {
  return trigger('title3', [
    transition(':enter', [
      style({
        opacity: -0.75,
        transform: 'translateX(+100%)'
      }),
      animate('1.75s', style({
        opacity: 1,
        transform: 'translateX(0%)'
      }))
    ])
  ]);
}


export function fadeInFast(): AnimationTriggerMetadata {
  return trigger('fadeIn', [
    transition(':enter', [
      style({
        opacity: 0,
      }),
      animate('0.5s', style({
        opacity: 1,
      }))
    ])
  ]);
}
