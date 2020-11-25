import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChildren,
  Directive, ElementRef, Input, OnInit, QueryList } from '@angular/core';

@Directive({
  selector: '[appTransitionGroupItem]'
})
export class TransitionGroupItemDirective {
  prevPos: any;
  newPos: any;
  el: HTMLElement;
  moved!: boolean;
  moveCallback: any;

  constructor(elRef: ElementRef) {
    this.el = elRef.nativeElement;
  }
}

@Directive({
  selector: '[appTransitionGroup]',
})
export class TransitionGroupDirective implements OnInit, AfterViewInit {

  @Input() appTransitionGroup!: string;

  @ContentChildren(TransitionGroupItemDirective) items!: QueryList<TransitionGroupItemDirective>;

  constructor() { }

  ngAfterViewInit(): void {
    console.log('view init', this.items);
    this.refreshPosition('prevPos');

    this.items.changes.subscribe(items => {
      console.log('...');
      items.forEach((item: { prevPos: any; newPos: any; }) => {
        item.prevPos = item.newPos || item.prevPos;
      });
      try {

        items.forEach(this.runCallback);
        this.refreshPosition('newPos');
        items.forEach(this.applyTranslation);

      } catch (error) {
        console.log(error);
      }
        // force reflow to put everything in position
      const offSet = document.body.offsetHeight;
      this.items.forEach(this.runTransition.bind(this));
    });
  }

  ngOnInit(): void {
  }

  runCallback(item: TransitionGroupItemDirective): void {
    if (item.moveCallback) {
      item.moveCallback();
    }
  }

  runTransition(item: TransitionGroupItemDirective): void {
    if (!item.moved) {
      return;
    }
    const cssClass = this.appTransitionGroup + '-move';
    const el = item.el;
    const style: any = el.style;
    el.classList.add(cssClass);
    style.transform = style.WebkitTransform = style.transitionDuration = '';
    el.addEventListener(
      'transitionend',
      (item.moveCallback = (e: any) => {
        if (!e || /transform$/.test(e.propertyName)) {
          el.removeEventListener('transitionend', item.moveCallback);
          item.moveCallback = null;
          el.classList.remove(cssClass);
        }
      })
    );
  }

  refreshPosition(prop: string): void {
    this.items.forEach((item: any) => {
      item[prop] = item.el.getBoundingClientRect();
    });
  }

  applyTranslation(item: TransitionGroupItemDirective): void {
    item.moved = false;
    const dx = item.prevPos.left - item.newPos.left;
    const dy = item.prevPos.top - item.newPos.top;
    if (dx || dy) {
      item.moved = true;
      const style: any = item.el.style;
      style.transform = style.WebkitTransform =
        'translate(' + dx + 'px,' + dy + 'px)';
      style.transitionDuration = '0s';
    }
  }
}
