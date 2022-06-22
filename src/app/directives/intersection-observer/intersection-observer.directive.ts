import {AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {async, delay, filter, Subject, Subscription} from "rxjs";

type IntersectionObserver_t = {
  entry: IntersectionObserverEntry,
  observer: IntersectionObserver
};

@Directive({
  selector: '[intersection-observer]'
})
export class IntersectionObserverDirective implements OnInit, AfterViewInit, OnDestroy {
  @Input() debounceTime = 0;
  @Input() threshold = 1;

  @Output() onVisible = new EventEmitter<HTMLElement>();

  private observer: IntersectionObserver | undefined;
  private subject$ = new Subject<IntersectionObserver_t>();
  private subscription: Subscription;

  constructor(private el: ElementRef) {
  }

  ngOnInit() {
    this.createObserver();
  }

  ngAfterViewInit() {
    this.startObservingElements();
  }

  ngOnDestroy() {
    if(this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }

    this.subject$.complete();
    this.subscription.unsubscribe();
  }

  private isVisible(element: HTMLElement) {
    return new Promise(resolve => {
      const observer = new IntersectionObserver(([entry]) => {
        resolve(entry.intersectionRatio === 1);
        observer.disconnect();
      });

      observer.observe(element);
    });
  }

  private createObserver() {
    const Options = {
      rootMargin: '0px',
      threshold: this.threshold
    };

    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if(entry.isIntersecting || entry.intersectionRatio > 0) {
          this.subject$.next({entry, observer});
        }
      })
    }, Options);
  }

  private startObservingElements() {
    if(!this.observer) {
      return;
    }

    this.observer.observe(this.el.nativeElement);

    this.subscription = this.subject$
      .pipe(delay(this.debounceTime), filter(Boolean))
      .subscribe(async({entry, observer}) => {
        const target = entry.target as HTMLElement;

        if(await this.isVisible(target)) {
          this.onVisible.emit(target);
          observer.unobserve(target);
        }
      });
  }
}
