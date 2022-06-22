import {Component} from "@angular/core";
import {CssInjectorService} from "../../../services/css-injector.service";

@Component({
  selector: 'skills',
  templateUrl: 'skills.html',
  styleUrls: ['skills.scss']
})
export class SkillsComponent {
  constructor(public cssInjector: CssInjectorService) {
  }
}
