import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

interface BlogPost {
  id: number;
  title: string;
  author: string;
  category: string;
  date: Date;
  image: string;
  description: string;
  featured?: boolean;
}

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class BlogComponent implements OnInit {
  // Mock blog posts
  allBlogPosts: BlogPost[] = [
    {
      id: 1,
      title: 'Cách phối đồ mùa đông dành cho nữ',
      author: 'Thu Trang',
      category: 'Thời trang nữ',
      date: new Date('2023-12-22'),
      image: 'assets/images/blog-01.jpg',
      description: 'Khám phá những cách phối đồ đẹp mắt và ấm áp trong mùa đông với các item thời trang nữ hot nhất hiện nay.',
      featured: true
    },
    {
      id: 2,
      title: 'Gợi ý quà tặng thời trang dành cho nam giới',
      author: 'Minh Hiếu',
      category: 'Thời trang nam',
      date: new Date('2023-12-18'),
      image: 'assets/images/blog-02.jpg',
      description: 'Danh sách những món quà thời trang dành cho phái mạnh trong mùa lễ hội, từ phụ kiện đến trang phục.'
    },
    {
      id: 3,
      title: 'Xu hướng thời trang từ đông sang xuân',
      author: 'Thanh Mai',
      category: 'Xu hướng',
      date: new Date('2023-12-10'),
      image: 'assets/images/blog-03.jpg',
      description: 'Cập nhật những xu hướng thời trang mới nhất cho mùa chuyển giao từ đông sang xuân.',
      featured: true
    },
    {
      id: 4,
      title: 'Cách chọn giày phù hợp với từng outfit',
      author: 'Quang Đạt',
      category: 'Phụ kiện',
      date: new Date('2023-12-05'),
      image: 'assets/images/blog-04.jpg',
      description: 'Hướng dẫn cách lựa chọn giày phù hợp với trang phục, từ giày thể thao đến giày công sở và giày dự tiệc.'
    },
    {
      id: 5,
      title: 'Chăm sóc quần áo len trong mùa lạnh',
      author: 'Phương Anh',
      category: 'Mẹo thời trang',
      date: new Date('2023-12-01'),
      image: 'assets/images/blog-05.jpg',
      description: 'Những mẹo hữu ích để bảo quản và chăm sóc đồ len, giúp quần áo luôn mới và bền đẹp trong suốt mùa đông.'
    },
    {
      id: 6,
      title: 'Phong cách Streetwear đang lên ngôi',
      author: 'Tuấn Anh',
      category: 'Xu hướng',
      date: new Date('2023-11-25'),
      image: 'assets/images/blog-06.jpg',
      description: 'Phong cách thời trang đường phố đang ngày càng được ưa chuộng bởi giới trẻ, với những item không thể thiếu.'
    }
  ];

  // Pagination properties
  blogPosts: BlogPost[] = [];
  featuredPosts: BlogPost[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 2; // Giảm số lượng bài viết hiển thị mỗi trang
  totalPages: number = 1;
  
  // Fallback image
  defaultImage: string = 'assets/images/blog-placeholder.jpg';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Lấy các bài viết nổi bật
    this.featuredPosts = this.allBlogPosts.filter(post => post.featured);
    
    // Tính toán trang và hiển thị bài viết
    this.calculateTotalPages();
    this.updateDisplayedPosts();
  }

  // Handle image loading errors
  handleImageError(event: any): void {
    event.target.src = this.defaultImage;
  }
  
  // Đảm bảo tất cả ảnh có cùng tỷ lệ khung hình
  onImageLoad(event: any): void {
    const img = event.target;
    // Đảm bảo tỷ lệ khung hình 16:9
    if (img.naturalWidth / img.naturalHeight !== 16/9) {
      img.style.objectFit = 'cover';
      img.style.objectPosition = 'center';
    }
  }
  
  // Navigation method
  navigateToBlogDetail(id: number): void {
    this.router.navigate(['/blog/detail', id]);
  }

  // Pagination methods
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.allBlogPosts.length / this.itemsPerPage);
  }

  updateDisplayedPosts(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.blogPosts = this.allBlogPosts.slice(startIndex, endIndex);
    this.cdr.markForCheck();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedPosts();
      
      // Scroll to top of blog section
      try {
        const element = document.querySelector('.sec-blog');
        if (element) {
          window.scrollTo({
            top: element.getBoundingClientRect().top + window.pageYOffset - 100,
            behavior: 'smooth'
          });
        }
      } catch (error) {
        console.error('Error scrolling to top of blog section:', error);
        // Fallback for browsers that don't support smooth scrolling
        window.scrollTo(0, 0);
      }
    }
  }

  getPageNumbers(): (number | null)[] {
    const pages: (number | null)[] = [];
    const maxPagesToShow = 5; // Show at most 5 page numbers
    
    if (this.totalPages <= maxPagesToShow) {
      // If total pages is less than max to show, display all pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      let startPage = Math.max(2, this.currentPage - 1);
      let endPage = Math.min(this.totalPages - 1, this.currentPage + 1);
      
      // Adjust if at the beginning or end
      if (this.currentPage <= 2) {
        endPage = Math.min(4, this.totalPages - 1);
      } else if (this.currentPage >= this.totalPages - 1) {
        startPage = Math.max(2, this.totalPages - 3);
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push(null); // null will be rendered as ellipsis
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < this.totalPages - 1) {
        pages.push(null); // null will be rendered as ellipsis
      }
      
      // Always include last page
      if (this.totalPages > 1) {
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }
}
