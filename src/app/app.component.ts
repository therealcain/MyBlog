import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {MarkdownFetcher} from "./services/github.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Blog';

  constructor(public router: Router) {
  }
}
