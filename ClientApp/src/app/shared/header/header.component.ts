import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserIdenity } from '../../model/user.model';
import { CartService } from 'src/app/service/product.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  user: any;
  items$ = this.cartService.items$;
  items1$ = this.cartService.items1$;
  categories: any[] = [];
  loading: boolean = true;

  constructor(public http: HttpClient, private cartService: CartService) {
    // Tải thông tin người dùng
    this.http.get(environment.URL_API + "Auth/AuthHistory").subscribe(
      res => {
        this.user = res;
      },
      error => {
        console.error('Error loading user info:', error);
      }
    );
    
    // Tải danh mục
    this.loadCategories();
  }

  ngOnInit(): void {
    // Thiết lập các sự kiện jQuery sau khi component đã được khởi tạo
    setTimeout(() => {
      this.setupJqueryEvents();
    }, 100);
  }

  setupJqueryEvents() {
    $('.js-show-modal-search').on('click', function () {
      $('.modal-search-header').addClass('show-modal-search');
      $(this).css('opacity', '0');
    });

    $('.js-hide-modal-search').on('click', function () {
      $('.modal-search-header').removeClass('show-modal-search');
      $('.js-show-modal-search').css('opacity', '1');
    });

    $('.js-show-cart').on('click', function () {
      $('.js-panel-cart').addClass('show-header-cart');
    });

    $('.js-hide-cart').on('click', function () {
      $('.js-panel-cart').removeClass('show-header-cart');
    });

    /* Cart */
    $('.js-show-sidebar').on('click', function () {
      $('.js-sidebar').addClass('show-sidebar');
    });

    $('.js-hide-sidebar').on('click', function () {
      $('.js-sidebar').removeClass('show-sidebar');
    });
    
    // Menu mobile
    $('.btn-show-menu-mobile').on('click', function() {
      $(this).toggleClass('is-active');
      $('.menu-mobile').slideToggle();
    });

    $('.arrow-main-menu-m').on('click', function() {
      $(this).parent().find('.sub-menu-m').slideToggle();
      $(this).toggleClass('turn-arrow-main-menu-m');
    });
  }

  logout() {
    this.http.post(environment.URL_API + "Auth/logout", {}).subscribe(
      res => {
      },
      error => {
      }
    );
    this.http.get(environment.URL_API + "Auth/AuthHistory").subscribe(
      res => {
        this.user = res;
      },
      error => {
      }
    );
    localStorage.removeItem('auth_token');
    localStorage.removeItem('products');
    localStorage.removeItem('idUser');
    window.location.href = "/login";
  }

  // Lấy danh sách danh mục sản phẩm từ API
  loadCategories() {
    this.loading = true;
    
    // Sử dụng endpoint Categories đã xác nhận hoạt động
    this.http.get<any[]>(environment.URL_API + 'loais').subscribe(
      (data) => {
        this.categories = data || [];
        this.loading = false;
        
        // Log thông tin để kiểm tra
        console.log('Categories loaded successfully:', this.categories);
        
        // Làm mới các sự kiện jQuery cho dropdown sau khi có dữ liệu
        setTimeout(() => {
          this.setupDropdownEvents();
        }, 100);
      },
      (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
        this.categories = [];
      }
    );
  }
  
  // Thiết lập sự kiện cho dropdown menu
  setupDropdownEvents() {
    // Menu mobile
    $('.arrow-main-menu-m').on('click', function() {
      $(this).parent().find('.sub-menu-m').slideToggle();
      $(this).toggleClass('turn-arrow-main-menu-m');
    });
    
    // Menu desktop
    $('.main-menu > li').hover(
      function() {
        $(this).find('.sub-menu').css({
          'display': 'block',
          'opacity': '1',
          'visibility': 'visible',
          'transform': 'translateY(0)'
        });
      },
      function() {
        $(this).find('.sub-menu').css({
          'opacity': '0',
          'visibility': 'hidden',
          'transform': 'translateY(10px)'
        });
      }
    );
  }
}
