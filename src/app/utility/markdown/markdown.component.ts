import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {MarkdownService} from "ngx-markdown";
import {BehaviorSubject} from "rxjs";
import {MarkdownHeader} from "./markdown-header";

@Component({
  selector: 'my-markdown',
  template: `
    <markdown [data]="(markdownText$ | async)!"></markdown>
  `,
  styleUrls: ['markdown.scss'],
})
export class MarkdownComponent implements OnInit, OnDestroy {
  @Input() path: string;

  private subscription: any;
  markdownText$ = new BehaviorSubject<string>("");

  constructor(private markdownService: MarkdownService) {
  }

  ngOnInit() {
    this.subscription = this.markdownService.getSource(this.path).subscribe(
      (text: any) => {
        let content = MarkdownHeader.Parse(text).content;
        this.markdownText$.next(this.markdownService.compile(content));
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();

  }
}
