import {Component} from "@angular/core";
import {CssInjectorService} from "../../../services/css-injector.service";

@Component({
  selector: 'social-media-footer',
  templateUrl: 'social-media-footer.html',
  styleUrls: ['social-media-footer.scss']
})
export class SocialMediaFooterComponent {

  constructor(public cssInjector: CssInjectorService) {
  }

  openLink(url: string) {
    window.open(url);
  }
}
