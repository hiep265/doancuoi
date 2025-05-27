import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Blog, BlogService } from './blog.service';
import { BlogComponent } from './blog/blog.component';
import * as signalR from '@microsoft/signalr';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss']
})
export class BlogsComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  
  constructor(
    public service: BlogService,
    public router: Router,
    public http: HttpClient,
    public dialog: MatDialog,
    public toastr: ToastrService,
    private sanitizer: DomSanitizer
  ) { }
  
  displayedColumns: string[] = ['id', 'tieude', 'hinh', 'noidung', 'actions'];
  public blog: Blog;
  
  ngOnInit(): void {
    this.service.getAllBlogs();
    const connection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Information)
      .withUrl('https://localhost:5001/notify')
      .build();
      
    connection.start().then(function () {
      console.log('SignalR Connected!');
    }).catch(function (err) {
      return console.error(err.toString());
    });
    
    connection.on("BroadcastMessage", () => {
      this.service.getAllBlogs();
    });
  }
  
  ngAfterViewInit(): void {
    this.service.dataSource.sort = this.sort;
    this.service.dataSource.paginator = this.paginator;
  }
  
  // Lấy URL hình ảnh
  getImageUrl(imageName: string): string {
    if (!imageName) return '';
    console.log('Image name:', imageName);
    return `https://localhost:5001/Images/list-image-blog/${imageName}`;
  }
  
  onModalDialog() {
    this.service.blog = new Blog();
    this.dialog.open(BlogComponent, {
      width: '60vw',
      panelClass: 'blog-dialog',
      disableClose: true
    });
  }
  
  doFilter = (value: string) => {
    this.service.dataSource.filter = value.trim().toLocaleLowerCase();
  }
  
  // Cắt ngắn nội dung hiển thị trong bảng
  truncateContent(content: string) {
    if (!content) return '';
    
    // Chuyển HTML thành text để cắt đúng
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Giới hạn 150 ký tự
    const truncated = textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent;
    
    return this.sanitizer.bypassSecurityTrustHtml(truncated);
  }
  
  // Mở dialog xem chi tiết nội dung
  viewContentDetail(blog: Blog) {
    this.dialog.open(BlogContentDetailComponent, {
      width: '600px',
      data: blog
    });
  }
  
  // Sửa blog với id
  editBlog(id: number) {
    this.service.getById(id).subscribe(
      (res: Blog) => {
        console.log('Blog data to edit:', res);
        this.service.blog = res;
        this.dialog.open(BlogComponent, {
          width: '60vw',
          panelClass: 'blog-dialog',
          disableClose: true
        });
      },
      err => {
        this.toastr.error("Không thể tải thông tin bài viết");
      }
    );
  }
  
  clickDelete(id) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận xóa',
        message: 'Bạn có chắc chắn muốn xóa bài viết này?',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.delete(id).subscribe(
          res => {
            this.service.getAllBlogs();
            this.toastr.success("Xóa thành công");
          },
          err => {
            this.toastr.error("Xóa thất bại");
          }
        );
      }
    });
  }
}

// Component hiển thị chi tiết nội dung blog
@Component({
  selector: 'app-blog-content-detail',
  template: `
    <h2 mat-dialog-title>{{data.tieuDe}}</h2>
    <mat-dialog-content>
      <div [innerHTML]="data.noiDung"></div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="true">Đóng</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      max-height: 70vh;
      padding: 20px;
    }
    h2 {
      margin-bottom: 16px;
      color: #3f51b5;
    }
  `]
})
export class BlogContentDetailComponent {
  constructor(
    public dialogRef: MatDialogRef<BlogContentDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Blog
  ) {}
}