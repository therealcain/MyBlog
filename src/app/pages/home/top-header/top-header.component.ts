import {Component, ElementRef, ViewChild} from "@angular/core";

@Component({
  selector: 'top-header',
  templateUrl: 'top-header.html',
  styleUrls: ['top-header.scss']
})
export class TopHeaderComponent {
  @ViewChild('SpaceBackground') public spaceBackground: ElementRef;
  private readonly Speed = 150;

  ngAfterViewInit() {
    this.spaceBackground.nativeElement.addEventListener('mousemove', (event: any) => {
      this.spaceBackground.nativeElement.style.backgroundPositionX = (-event.offsetX / this.Speed) + "px";
      this.spaceBackground.nativeElement.style.backgroundPositionY = (-event.offsetY / this.Speed) + "px";
    });
  }
}
