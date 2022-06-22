import {Component, OnDestroy, OnInit} from "@angular/core";
import {map, Subscription, switchMap} from "rxjs";
import {MarkdownFetcher} from "../../services/github.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'articles-page',
  templateUrl: 'articles.html',
  styleUrls: ['articles.scss']
})
export class ArticlesPageComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  path: string;

  constructor(private mdService: MarkdownFetcher, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.subscription = this.route.params.pipe(
      switchMap(params => this.mdService.markdownsHeaders$.pipe(
        map(headers => {
          return {headers, params};
        })
      )))
      .subscribe((data: any) => {
        for (let value of data.headers) {
          if (value.title === data.params['name']) {
            this.path = value.path;
          }
        }
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
