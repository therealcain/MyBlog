import {Injectable} from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class CssInjectorService {

  inject(element: HTMLElement, css_class: string, remove = false) {
    const Delimeter = ' ';
    let classes = element.className.split(Delimeter);

    if(remove) {
      classes.splice(classes.indexOf(css_class), 1);
    }
    else {
      classes.push(css_class);
    }

    element.className = classes.join(Delimeter);
  }

  removeAndInject(element: HTMLElement, css_class_to_remove: string, css_class_to_swap: string) {
    this.inject(element, css_class_to_remove, true);
    this.inject(element, css_class_to_swap);
  }
}
