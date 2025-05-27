import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImgFallbackDirective } from './directives/img-fallback.directive';

@NgModule({
  declarations: [
    ImgFallbackDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ImgFallbackDirective
  ]
})
export class SharedModule { } 