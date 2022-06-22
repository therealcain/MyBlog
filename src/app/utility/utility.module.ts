import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {MarkdownComponent} from "./markdown/markdown.component";
import {MarkdownModule} from "ngx-markdown";
import {ScrollingProgressBarComponent} from "./scrolling-progress-bar.component";
import {MatProgressBarModule} from "@angular/material/progress-bar";

@NgModule({
  imports: [CommonModule, MarkdownModule, MatProgressBarModule],
  declarations: [MarkdownComponent, ScrollingProgressBarComponent],
  exports: [MarkdownComponent, ScrollingProgressBarComponent]
})
export class UtilityModule {

}
