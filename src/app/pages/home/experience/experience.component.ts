import {Component} from "@angular/core";
import {CssInjectorService} from "../../../services/css-injector.service";

@Component({
  selector: 'experience',
  templateUrl: 'experience.html',
  styleUrls: ['experience.scss']
})
export class ExperienceComponent {
  constructor(public cssInjector: CssInjectorService) {
  }
}
