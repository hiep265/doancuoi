import { Directive, Input, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]'
})
export class ImgFallbackDirective {
  @Input() appImgFallback: string = 'assets/images/product-01.jpg';
  private hasError = false;

  constructor(private el: ElementRef) {}

  @HostListener('error')
  onError() {
    if (!this.hasError) {
      this.hasError = true;
      this.el.nativeElement.src = this.appImgFallback;
    }
  }
} 