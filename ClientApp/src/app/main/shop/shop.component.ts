import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Product } from 'src/app/model/product.model';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {
  products: Product[] = [];
  categoryId: number | null = null;
  categoryName: string = '';
  loading: boolean = false;

  constructor(
    private http: HttpClient, 
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Lắng nghe thay đổi của route params
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.categoryId = +id;
        this.getProductsByCategory(this.categoryId);
      } else {
        this.getAllProducts();
      }
    });
  }

  // Lấy tất cả sản phẩm
  getAllProducts() {
    this.loading = true;
    this.http.get<Product[]>(environment.URL_API + 'sanphams/laytatcasanpham')
      .subscribe(
        (data) => {
          this.products = data;
          this.categoryName = 'Tất cả sản phẩm';
          this.loading = false;
        },
        (error) => {
          console.error('Error loading products:', error);
          this.loading = false;
        }
      );
  }

  // Lấy sản phẩm theo danh mục
  getProductsByCategory(categoryId: number) {
    this.loading = true;
    
    // Sử dụng endpoint Categories đã xác nhận hoạt động
    this.http.get<any[]>(environment.URL_API + 'loais/' + categoryId + '/products')
      .subscribe(
        (data) => {
          console.log('Products by category loaded successfully:', data);
          
          // Map data to ensure all products have valid image paths
          this.products = data.map(product => {
            // Ensure product has a valid image property
            if (!product.image || product.image === null || product.image === undefined) {
              // If image is not available, check if we have imageSanPhams
              if (product.imageSanPhams && product.imageSanPhams.length > 0) {
                product.image = product.imageSanPhams[0].imageName;
              } else {
                // Don't set a default server path - let the directive handle fallback
                product.image = '';
              }
            }
            
            return product;
          });
          
          if (data.length > 0) {
            this.categoryName = data[0].tenLoai;
          }
          this.loading = false;
        },
        (error) => {
          console.error('Error loading category products:', error);
          this.loading = false;
          this.products = [];
          
          // Hiển thị thông báo lỗi
          alert('Không thể tải sản phẩm. Vui lòng thử lại sau.');
        }
      );
  }

  // Handle image loading errors
  useDefaultImage(event: any) {
    event.target.src = 'assets/images/product-01.jpg';
  }
}
