import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ToastServiceService } from '../../../shared/toast-service.service';
import { BlogService } from '../blog.service';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  public Editor = ClassicEditor;
  public editorConfig = {
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'link',
      '|',
      'bulletedList',
      'numberedList',
      '|',
      'indent',
      'outdent',
      '|',
      'imageUpload',
      'blockQuote',
      'insertTable',
      'mediaEmbed',
      'undo',
      'redo',
      '|',
      'alignment',
      'fontColor',
      'fontSize',
      'highlight'
    ],
    language: 'vi',
    image: {
      toolbar: [
        'imageTextAlternative',
        'imageStyle:full',
        'imageStyle:side'
      ]
    },
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells'
      ]
    },
    placeholder: 'Nhập nội dung bài viết tại đây...',
    heading: {
      options: [
          { model: 'paragraph', title: 'Đoạn văn', class: 'ck-heading_paragraph' },
          { model: 'heading1', view: 'h1', title: 'Tiêu đề 1', class: 'ck-heading_heading1' },
          { model: 'heading2', view: 'h2', title: 'Tiêu đề 2', class: 'ck-heading_heading2' },
          { model: 'heading3', view: 'h3', title: 'Tiêu đề 3', class: 'ck-heading_heading3' },
          { model: 'heading4', view: 'h4', title: 'Tiêu đề 4', class: 'ck-heading_heading4' }
      ]
    }
  };
  
  public newFormGroup: FormGroup;
  urls = new Array<string>();
  selectedFile: FileList;
  isLoading = false;
  existingImage = '';
  
  constructor(
    public service: BlogService,
    public http: HttpClient,
    public toastr: ToastrService,
    public serviceToast: ToastServiceService,
    private dialogRef: MatDialogRef<BlogComponent>
  ) {}
                
  ngOnInit(): void {
    this.isLoading = true;
    this.newFormGroup = new FormGroup({
      TieuDe: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      NoiDung: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
      ]),
      Hinh: new FormControl(null)
    });

    // Nếu đang ở chế độ sửa, thiết lập giá trị cho form
    if (this.service.blog.id != 0) {
      this.loadExistingBlog();
    } else {
      this.isLoading = false;
    }
  }
  
  // Lấy URL hình ảnh
  getImageUrl(imageName: string): string {
    if (!imageName) return '';
    console.log('Rendering image:', imageName);
    return `https://localhost:5001/Images/list-image-blog/${imageName}`;
  }
  
  // Tải thông tin blog hiện tại khi đang ở chế độ sửa
  loadExistingBlog() {
    console.log('Loading existing blog data:', this.service.blog);
    
    this.newFormGroup.patchValue({
      TieuDe: this.service.blog.tieuDe,
      NoiDung: this.service.blog.noiDung
    });
    
    if (this.service.blog.image) {
      console.log('Existing image found:', this.service.blog.image);
      this.existingImage = this.service.blog.image;
      this.newFormGroup.get('Hinh').setErrors(null);
    } else {
      console.log('No existing image found');
    }
    
    this.isLoading = false;
  }

  gopHam(event) {
    this.detectFiles(event);
    this.onSelectFile(event);
  }

  removeImage(index: number) {
    // Xóa ảnh khỏi preview
    this.urls.splice(index, 1);
    
    // Tạo một FileList mới không có ảnh đã xóa
    const dt = new DataTransfer();
    const files = this.selectedFile;
    
    for (let i = 0; i < files.length; i++) {
      if (i !== index) {
        dt.items.add(files[i]);
      }
    }
    
    this.selectedFile = dt.files;
    
    // Cập nhật lại validator nếu không còn ảnh nào và không có ảnh hiện tại
    if (this.urls.length === 0 && !this.existingImage) {
      this.newFormGroup.get('Hinh').setErrors({required: true});
    }
  }
  
  // Xóa ảnh hiện tại
  removeExistingImage() {
    console.log('Removing existing image:', this.existingImage);
    this.existingImage = '';
    
    // Kiểm tra nếu không có ảnh mới nào
    if (this.urls.length === 0) {
      this.newFormGroup.get('Hinh').setErrors({required: true});
    }
  }

  detectFiles(event) {
    this.urls = [];
    let files = event.target.files;
    if (files.length > 0) {
      this.newFormGroup.get('Hinh').setErrors(null);
    }
    
    for (let file of files) {
      let reader = new FileReader();
      reader.onload = (e: any) => {
        this.urls.push(e.target.result);
      }
      reader.readAsDataURL(file);
    }
  }
  
  onSelectFile(fileInput: any) {
    this.selectedFile = <FileList>fileInput.target.files;
  }
  
  clearForm() {
    this.newFormGroup.reset();
    this.urls = [];
    this.existingImage = '';
  }
  
  onSubmit = (data) => {
    this.isLoading = true;
    const userId = localStorage.getItem('userId') || '1';
    console.log('User ID being used:', userId);
    
    if (this.service.blog.id == 0) {
      // Thêm mới
      let form = new FormData();
      
      form.append('TieuDe', data.TieuDe);
      form.append('NoiDung', data.NoiDung);
      form.append('FkUserId', userId);
      
      // Nếu có ảnh, gửi ảnh
      if (this.urls.length > 0 && this.selectedFile && this.selectedFile.length > 0) {
        form.append('files', this.selectedFile[0]);
      }
      
      // Log form data để debug
      this.logFormData(form);
      
      this.service.post(form)
        .subscribe(
          res => {
            this.serviceToast.showToastThemThanhCong();
            this.clearForm();
            this.service.getAllBlogs();
            this.dialogRef.close();
            this.isLoading = false;
          }, 
          err => {
            console.error('Error posting blog:', err);
            console.error('Status:', err.status);
            console.error('Status text:', err.statusText);
            
            // Cố gắng giải mã lỗi
            if (err.error instanceof ArrayBuffer) {
              const decoder = new TextDecoder('utf-8');
              const errorText = decoder.decode(err.error);
              console.error('Decoded error:', errorText);
            } else if (typeof err.error === 'string') {
              console.error('Error message:', err.error);
            } else if (err.error) {
              console.error('Error object:', err.error);
            }
            
            this.serviceToast.showToastThemThatBai();
            this.isLoading = false;
        }
        );
    } else {
      // Cập nhật blog hiện có
      const form = new FormData();
      form.append('Id', this.service.blog.id.toString());
      form.append('TieuDe', data.TieuDe);
      form.append('NoiDung', data.NoiDung);
      form.append('FkUserId', userId);
      
      // QUAN TRỌNG: Trong PutBlog backend, nếu upload.files là null thì sẽ giữ lại ảnh cũ
      // Nếu có ảnh mới, gửi ảnh mới thông qua trường files
      // Nếu không có ảnh mới, không gửi trường files để backend giữ ảnh cũ
      if (this.urls.length > 0 && this.selectedFile && this.selectedFile.length > 0) {
        form.append('files', this.selectedFile[0]);
      }
      
      // Log form data để debug với nhiều thông tin hơn
      console.log('Update blog with ID:', this.service.blog.id);
      console.log('Has existing image:', !!this.existingImage);
      console.log('Has new image:', this.urls.length > 0);
      this.logFormData(form);
      
      // Thử phương thức POST thay thế cho PUT
      // Backend đã có sẵn endpoint POST /api/blogs/update/{id} để xử lý cập nhật
      console.log('Using POST endpoint for update...');
      this.service.updateViaPost(this.service.blog.id, form)
        .subscribe(
          res => {
            this.serviceToast.showToastSuaThanhCong();
            this.clearForm();
            this.service.getAllBlogs();
            this.dialogRef.close();
            this.isLoading = false;
          },
          err => {
            console.error('Error updating blog:', err);
            console.error('Status:', err.status);
            console.error('Status text:', err.statusText);
            
            // Cố gắng giải mã lỗi
            if (err.error instanceof ArrayBuffer) {
              const decoder = new TextDecoder('utf-8');
              const errorText = decoder.decode(err.error);
              console.error('Decoded error:', errorText);
            } else if (typeof err.error === 'string') {
              console.error('Error message:', err.error);
            } else if (err.error) {
              console.error('Error object:', err.error);
            }
            
            // Thử lại với phương thức PUT
            console.log('Retrying with PUT method...');
            this.retryWithPutMethod(form);
          }
        );
    }
  }
  
  // Phương thức thử lại bằng PUT nếu POST không hoạt động
  retryWithPutMethod(form: FormData) {
    this.service.put(this.service.blog.id, form)
      .subscribe(
        res => {
          this.serviceToast.showToastSuaThanhCong();
          this.clearForm();
          this.service.getAllBlogs();
          this.dialogRef.close();
          this.isLoading = false;
        },
        err => {
          console.error('Error updating blog with PUT method:', err);
          console.error('Status:', err.status);
          console.error('Status text:', err.statusText);
          
          this.serviceToast.showToastSuaThatBai();
          this.isLoading = false;
        }
      );
  }
  
  // Helper để log form data
  logFormData(formData: FormData) {
    console.log('Form data being sent:');
    
    // Log all key/value pairs
    console.log('TieuDe:', formData.get('TieuDe'));
    console.log('NoiDung:', formData.get('NoiDung'));
    console.log('Id:', formData.get('Id'));
    console.log('FkUserId:', formData.get('FkUserId'));
    
    // Check for files
    const files = formData.getAll('files');
    if (files && files.length > 0) {
      console.log(`Files: ${files.length} files attached`);
      files.forEach((file: any, index) => {
        if (file instanceof File) {
          console.log(`File ${index}: ${file.name} (${file.size} bytes, ${file.type})`);
        } else {
          console.log(`File ${index}: not a File object:`, file);
        }
      });
    } else {
      console.log('No files attached');
    }

    // Log all entry pairs in FormData (debug)
    console.log('Full FormData entries:');
    // Cast to any to fix TypeScript error with entries()
    const formDataAny = formData as any;
    for (const pair of formDataAny.entries()) {
      console.log(`${pair[0]}: ${pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]}`);
    }
  }
  
  cancel() {
    this.dialogRef.close();
  }
}
