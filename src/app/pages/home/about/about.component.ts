import {Component} from "@angular/core";
import {CssInjectorService} from "../../../services/css-injector.service";

@Component({
  selector: 'about',
  templateUrl: 'about.html',
  styleUrls: ['about.scss']
})
export class AboutComponent {
  constructor(public cssInjector: CssInjectorService) {
  }
}
