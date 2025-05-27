import { HttpClient } from '@angular/common/http';
import { Injectable, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class BlogService {
  @ViewChild(MatSort) sort: MatSort;  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public dataSource = new MatTableDataSource<Blog>();
  blog: Blog = new Blog();
  
  constructor(public http: HttpClient) { }
  
  get(): Observable<any> {
    return this.http.get(environment.URL_API + "blogs")
      .pipe(
        tap(response => {
          console.log('API response (get all):', response);
        })
      );
  }
  
  getById(id: number): Observable<any> {
    return this.http.get(environment.URL_API + "blogs/" + id)
      .pipe(
        tap(response => {
          console.log('API response (getById):', response);
        })
      );
  }
  
  delete(id: number) {
    return this.http.delete(`${environment.URL_API + "blogs"}/${id}`);
  }
  
  post(blog: any): Observable<any> {
    console.log(`Calling POST to ${environment.URL_API + 'blogs'} with data:`, blog);
    return this.http.post<any>(environment.URL_API + 'blogs', blog)
      .pipe(
        tap(
          response => {
            console.log('API response (post):', response);
          },
          error => {
            console.error('API error (post):', error);
            if (error.error instanceof ArrayBuffer) {
              const decoder = new TextDecoder('utf-8');
              const errorText = decoder.decode(error.error);
              console.error('Decoded error:', errorText);
            } else {
              console.error('Error detail:', error.error);
            }
          }
        )
      );
  }
  
  put(id: number, blog: any): Observable<any> {
    console.log(`Calling PUT to ${environment.URL_API + 'blogs/' + id} with data:`, blog);
    return this.http.put<any>(environment.URL_API + 'blogs/' + id, blog)
      .pipe(
        tap(
          response => {
            console.log('API response (put):', response);
          },
          error => {
            console.error('API error (put):', error);
            console.error('Status:', error.status);
            console.error('Status text:', error.statusText);
            
            if (error.error instanceof ArrayBuffer) {
              const decoder = new TextDecoder('utf-8');
              const errorText = decoder.decode(error.error);
              console.error('Decoded error:', errorText);
            } else if (typeof error.error === 'string') {
              console.error('Error message:', error.error);
            } else if (error.error) {
              console.error('Error object:', error.error);
            }
            
            // Thử kết nối lại endpoint khác nếu lỗi 405 (Method Not Allowed)
            if (error.status === 405) {
              console.error('Got 405 Method Not Allowed. This might be because the server does not support PUT for this endpoint.');
            }
          }
        )
      );
  }
  
  // Thêm một phương thức thay thế dùng POST để cập nhật blog
  // Sử dụng khi PUT gặp vấn đề
  updateViaPost(id: number, blog: any): Observable<any> {
    console.log(`Calling POST to ${environment.URL_API + 'blogs/update/' + id} with data:`, blog);
    return this.http.post<any>(environment.URL_API + 'blogs/update/' + id, blog)
      .pipe(
        tap(
          response => {
            console.log('API response (updateViaPost):', response);
          },
          error => {
            console.error('API error (updateViaPost):', error);
            console.error('Status:', error.status);
            console.error('Status text:', error.statusText);
            
            if (error.error instanceof ArrayBuffer) {
              const decoder = new TextDecoder('utf-8');
              const errorText = decoder.decode(error.error);
              console.error('Decoded error:', errorText);
            } else if (typeof error.error === 'string') {
              console.error('Error message:', error.error);
            } else if (error.error) {
              console.error('Error object:', error.error);
            }
          }
        )
      );
  }
  
  getAllBlogs() {
    this.get().subscribe(
      res => {
        console.log('Data received for table:', res);
        this.dataSource.data = res as Blog[];
      },
      err => {
        console.error('Error fetching blogs:', err);
      }
    );
  }
}

export class Blog {
  id: number = 0;
  tieuDe: string = '';
  noiDung: string = '';
  image: string = '';
}
