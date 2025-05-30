import { Component, OnInit, HostListener } from '@angular/core';
import { SharedService } from '../shared.service';
declare var $: any;
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  showBackToTop = false;

  constructor(public sharedservice:SharedService) { }

  ngOnInit(): void {
    $('.wrap-slick3').each(function(){
      $(this).find('.slick3').slick({
          slidesToShow: 1,
          slidesToScroll: 1,
          fade: true,
          infinite: true,
          autoplay: false,
          autoplaySpeed: 6000,
          arrows: true,
          appendArrows: $(this).find('.wrap-slick3-arrows'),
          prevArrow:'<button class="arrow-slick3 prev-slick3"><i class="fa fa-angle-left" aria-hidden="true"></i></button>',
          nextArrow:'<button class="arrow-slick3 next-slick3"><i class="fa fa-angle-right" aria-hidden="true"></i></button>',
          dots: true,
          appendDots: $(this).find('.wrap-slick3-dots'),
          dotsClass:'slick3-dots',
          customPaging: function(slick, index) {
              var portrait = $(slick.$slides[index]).data('thumb');
              return '<img src=" ' + portrait + ' "/><div class="slick3-dot-overlay"></div>';
          },  
      });
    });

    $('.btn-num-product-down').on('click', function(){
      var numProduct = Number($(this).next().val());
      if(numProduct > 0) $(this).next().val(numProduct - 1);
    });

    $('.btn-num-product-up').on('click', function(){
      var numProduct = Number($(this).prev().val());
      $(this).prev().val(numProduct + 1);
    });

    // Kích hoạt nút back to top khi click
    $('#myBtn').on('click', () => {
      this.scrollToTop();
    });
  }

  // Theo dõi cuộn trang để hiển thị nút "Back to top"
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showBackToTop = window.scrollY > 300;
    
    // Hiển thị hoặc ẩn nút Back to top
    if (this.showBackToTop) {
      $('#myBtn').fadeIn();
    } else {
      $('#myBtn').fadeOut();
    }
  }

  // Cuộn lên đầu trang
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
