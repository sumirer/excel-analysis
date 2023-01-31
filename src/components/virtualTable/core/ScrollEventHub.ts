import { ScrollCallback, IScrollPosition } from '@/types/virtual';

export default class ScrollEventHub {
  public scrollXListener: Array<ScrollCallback> = [];

  public scrollYListener: Array<ScrollCallback> = [];

  public scrollListener: Array<ScrollCallback> = [];

  public scrollWithElement: Array<HTMLDivElement> = [];

  public lastX = 0;

  public lastY = 0;

  public register(callback: ScrollCallback): void {
    this.scrollListener.push(callback);
  }

  public registerX(callback: ScrollCallback): void {
    this.scrollXListener.push(callback);
  }

  public registerY(callback: ScrollCallback): void {
    this.scrollYListener.push(callback);
  }

  public unregisterX(callback: ScrollCallback): void {
    this.scrollXListener.splice(this.scrollXListener.indexOf(callback), 1);
  }

  public unregisterY(callback: ScrollCallback): void {
    this.scrollYListener.splice(this.scrollYListener.indexOf(callback), 1);
  }

  public unregister(callback: ScrollCallback): void {
    this.scrollListener.splice(this.scrollListener.indexOf(callback), 1);
  }

  public notifyAll(position: IScrollPosition): void {
    this.scrollListener.forEach((callback) => {
      callback(position);
    });
  }

  public notifyAllX(position: IScrollPosition): void {
    this.scrollXListener.forEach((callback) => {
      callback(position);
    });
  }

  public notifyAllY(position: IScrollPosition): void {
    this.scrollYListener.forEach((callback) => {
      callback(position);
    });
  }

  public registerScrollWithTarget(divElement: HTMLDivElement): void {
    this.scrollWithElement.push(divElement);
  }

  public unregisterScrollWith(divElement: HTMLDivElement): void {
    this.scrollWithElement.splice(this.scrollWithElement.indexOf(divElement), 1);
  }

  public notifyScroll(x: number): void {
    this.scrollWithElement.forEach((div) => {
      const child = div.children.item(0) as HTMLDivElement;
      if (child) {
        child.style.transform = `translateX(${-x}px)`;
      }
    });
  }

  public handleScrollChange(x: number, y: number): void {
    if (x !== this.lastX || y !== this.lastY) {
      this.notifyAll({ x, y });
    }
    if (x !== this.lastX) {
      this.lastX = x;
      this.notifyAllX({ x, y });
    }
    if (y !== this.lastY) {
      this.lastY = y;
      this.notifyAllY({ x, y });
    }
    this.notifyScroll(x);
  }
}
