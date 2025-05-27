import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Interface for the blog detail
interface BlogDetail {
  id: number;
  tieude: string;
  noidung: string;
  image?: string;
  tacGia?: string;
  ngayDang?: Date;
  moTa?: string;
  imageUrl?: string;
  processedContent?: SafeHtml;
}

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  public blogDetail: BlogDetail | null = null;
  public blogId: number;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.blogId = +params['id'];
      this.loadBlogDetail(this.blogId);
    });
  }

  loadBlogDetail(id: number) {
    // Using the available getBlog endpoint which returns all blogs
    this.http.post(`${environment.URL_API}blogs/getBlog`, {}).subscribe(
      (res: any[]) => {
        // Find the specific blog by ID
        const blog = res.find(b => b.id === id);
        if (blog) {
          console.log('Found blog from API:', blog); // Debug log
          // Map to match the template properties
          this.blogDetail = {
            id: blog.id,
            tieude: blog.tieude,
            noidung: blog.noidung,
            image: blog.image,
            tacGia: 'Admin', // Default author
            ngayDang: new Date(), // Default date
            imageUrl: this.getBlogImage(blog.image), // Add direct image URL
            processedContent: this.sanitizer.bypassSecurityTrustHtml(blog.noidung)
          };
        } else {
          console.error('Blog not found');
          this.loadFallbackBlogDetail(id);
        }
      },
      error => {
        console.error('Không thể tải chi tiết blog:', error);
        // Fallback to demo data if API request fails
        this.loadFallbackBlogDetail(id);
      }
    );
  }

  loadFallbackBlogDetail(id: number) {
    // This provides demo data when the API is not available
    const demoBlogs: BlogDetail[] = [
      {
        id: 1,
        tieude: 'Cách phối đồ mùa đông dành cho nữ',
        tacGia: 'Thu Trang',
        ngayDang: new Date('2023-12-22'),
        image: 'blog-01.jpg',
        noidung: 'Khám phá những cách phối đồ đẹp mắt và ấm áp trong mùa đông với các item thời trang nữ hot nhất hiện nay. Mùa đông là thời điểm lý tưởng để bạn thể hiện phong cách thời trang của mình với những lớp áo chồng lên nhau một cách hợp lý.',
        moTa: 'Một số gợi ý phối đồ mùa đông: Áo len cổ lọ kết hợp với quần jeans và boots cao cổ, Áo khoác dáng dài với váy len và boots, Áo len oversized với quần legging và giày thể thao.',
        processedContent: this.sanitizer.bypassSecurityTrustHtml('Khám phá những cách phối đồ đẹp mắt và ấm áp trong mùa đông với các item thời trang nữ hot nhất hiện nay. Mùa đông là thời điểm lý tưởng để bạn thể hiện phong cách thời trang của mình với những lớp áo chồng lên nhau một cách hợp lý.')
      },
      {
        id: 2,
        tieude: 'Gợi ý quà tặng thời trang dành cho nam giới',
        tacGia: 'Minh Hiếu',
        ngayDang: new Date('2023-12-18'),
        image: 'blog-02.jpg',
        noidung: 'Danh sách những món quà thời trang dành cho phái mạnh trong mùa lễ hội, từ phụ kiện đến trang phục. Việc lựa chọn quà tặng thời trang cho nam giới đôi khi gặp nhiều khó khăn vì phái mạnh thường không bày tỏ rõ sở thích.',
        moTa: 'Một số gợi ý quà tặng: Đồng hồ nam tính, Ví da cao cấp, Áo len cashmere, Thắt lưng da, Nước hoa nam.',
        processedContent: this.sanitizer.bypassSecurityTrustHtml('Danh sách những món quà thời trang dành cho phái mạnh trong mùa lễ hội, từ phụ kiện đến trang phục. Việc lựa chọn quà tặng thời trang cho nam giới đôi khi gặp nhiều khó khăn vì phái mạnh thường không bày tỏ rõ sở thích.')
      },
      {
        id: 3,
        tieude: 'Xu hướng thời trang từ đông sang xuân',
        tacGia: 'Thanh Mai',
        ngayDang: new Date('2023-12-10'),
        image: 'blog-03.jpg',
        noidung: 'Cập nhật những xu hướng thời trang mới nhất cho mùa chuyển giao từ đông sang xuân. Thời kỳ giao mùa luôn đặt ra thách thức trong việc lựa chọn trang phục phù hợp với thời tiết thay đổi.',
        moTa: 'Một số xu hướng nổi bật: Họa tiết hoa nhẹ nhàng, Layer mỏng, Màu pastel, Áo khoác chuyển mùa.',
        processedContent: this.sanitizer.bypassSecurityTrustHtml('Cập nhật những xu hướng thời trang mới nhất cho mùa chuyển giao từ đông sang xuân. Thời kỳ giao mùa luôn đặt ra thách thức trong việc lựa chọn trang phục phù hợp với thời tiết thay đổi.')
      }
    ];

    const foundBlog = demoBlogs.find(blog => blog.id === id);
    if (foundBlog) {
      foundBlog.imageUrl = this.getBlogImage(foundBlog.image);
      this.blogDetail = foundBlog;
    }
  }
  
  getBlogImage(imageUrl: string): string {
    if (!imageUrl) {
      return 'assets/images/blog-01.jpg';
    }
    
    // Debug log
    console.log('Processing image URL:', imageUrl);
    
    // Check if image is from our demo data or from API
    if (imageUrl.includes('blog-0')) {
      // Demo data image
      return `assets/images/${imageUrl}`;
    } else {
      // API image
      return `https://localhost:5001/Images/list-image-blog/${imageUrl}`;
    }
  }
  
  handleImageError(event: any): void {
    console.log('Image load error, using fallback');
    // If image fails to load, replace with default
    event.target.src = 'assets/images/blog-01.jpg';
  }
}
