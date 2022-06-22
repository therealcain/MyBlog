import {AfterViewInit, Component, OnDestroy, ViewChild} from "@angular/core";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {MarkdownFetcher} from "../../../services/github.service";
import {BehaviorSubject, every, map, min, partition, Subscription, toArray} from "rxjs";
import {MarkdownHeader} from "../../../utility/markdown/markdown-header";
import {CssInjectorService} from "../../../services/css-injector.service";
import {B} from "@angular/cdk/keycodes";

@Component({
  selector: 'articles',
  templateUrl: 'articles.html',
  styleUrls: ['articles.scss']
})
export class ArticlesComponent  {
  readonly PageSize: number = 2;
  lowValue = 0;
  highValue = this.PageSize;

  constructor(public mdService: MarkdownFetcher, public cssInjector: CssInjectorService) {

  }

  public getPaginatorData(event: PageEvent): PageEvent {
    this.lowValue = event.pageIndex * event.pageSize;
    this.highValue = this.lowValue + event.pageSize;
    return event;
  }

}
