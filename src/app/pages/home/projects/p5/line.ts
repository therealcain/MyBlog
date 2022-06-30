import {P5Renderer} from "./p5-renderer";

export class LineP5 extends P5Renderer {
  constructor(element: HTMLElement) {
    super(element);
  }

  setup() {
    this.p5.createCanvas(400, 400);
  }

  draw() {
    this.p5.stroke(0);
    this.p5.circle(200, 200, 2);
    this.p5.background(1);
  }
}
