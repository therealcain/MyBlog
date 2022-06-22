import {Component, Input} from "@angular/core";
import {BehaviorSubject, Subscription} from "rxjs";

@Component({
  selector: 'scrolling-progress-bar',
  template: `
    <mat-progress-bar mode="determinate" [value]="progressBarValue$ | async"></mat-progress-bar>
  `,
  styles: [`
    :host {
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      z-index: 999;
    }
  `]
})
export class ScrollingProgressBarComponent {
  @Input() initial: number = 0;
  progressBarValue$ = new BehaviorSubject(this.initial);

  constructor() {
    window.addEventListener('scroll', (event: any) => {
      // Current scroll position
      let current = event.target.scrollingElement.scrollTop;

      // Finding the maximum the scroll can go to without margin and padding.
      let element = document.documentElement;
      let cs = getComputedStyle(element);
      let paddingY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      let borderY = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
      let elementHeight = element.offsetHeight - paddingY - borderY;
      let max = document.documentElement.scrollHeight - elementHeight;

      this.progressBarValue$.next((current / max) * 100);
    }, true);
  }
}
