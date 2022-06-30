import {Component} from "@angular/core";
import {CssInjectorService} from "../../../services/css-injector.service";

@Component({
  selector: 'skills',
  templateUrl: 'skills.html',
  styleUrls: ['skills.scss']
})
export class SkillsComponent {

  elements = [
    "Modern C++",
    "C",
    "C#",
    "Assembly Language",
    "Java",
    "JavaScript",
    "TypeScript",
    "Python",
    "HTML",
    "CSS",
    "SASS",
    "Bash",
    "Arduino",
    "Linux",
    "OpenGL",
    "OpenCV",
    "Angular",
    "Windows API",
    "SDL",
    "SFML",
    "GLFW",
    "Selenium",
    "P5",
    "CMake",
    "Make",
    "GDB",
    "Valgrind",
    "Git",
    "SSH",
    "WHMCS",
    "Postman",
    "Travis CI",
    "Vim",
    "Sockets Programming",
    "Networking"
  ]

  constructor(public cssInjector: CssInjectorService) {
  }
}
