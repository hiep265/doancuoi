import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ChatMessage, ApiChatRequest, WebhookResponse } from '../model/chat.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = '/api/UserChats';
  private webhookUrl = 'http://localhost:5678/webhook/chatmessage';
  
  constructor(private http: HttpClient) { }

  // Kiểm tra xem người dùng đã đăng nhập chưa
  isUserLoggedIn(): boolean {
    // Kiểm tra localStorage hoặc sessionStorage để xem có token hoặc thông tin người dùng không
    return !!localStorage.getItem('currentUser');
  }
  
  // Lấy ID của người dùng hiện tại nếu đã đăng nhập
  getCurrentUserId(): number | null {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Lấy lịch sử chat từ API (chỉ gọi khi người dùng đã đăng nhập)
  getChats(): Observable<any[]> {
    if (!this.isUserLoggedIn()) {
      return of([]); // Trả về mảng rỗng nếu chưa đăng nhập
    }
    return this.http.get<any[]>(`${this.apiUrl}/getchat`);
  }

  // Lưu tin nhắn người dùng vào database (chỉ lưu khi đã đăng nhập)
  saveUserMessage(userId: number, message: string): Observable<any> {
    if (!this.isUserLoggedIn()) {
      return of(null); // Trả về Observable ngay lập tức nếu chưa đăng nhập
    }
    
    const formData = new FormData();
    formData.append('IdUser', userId.toString());
    formData.append('Content', message);
    
    return this.http.post(`${this.apiUrl}/addchat`, formData);
  }

  // Lưu tin nhắn phản hồi (bot) vào database (chỉ lưu khi đã đăng nhập)
  saveBotMessage(message: string): Observable<any> {
    if (!this.isUserLoggedIn()) {
      return of(null); // Trả về Observable ngay lập tức nếu chưa đăng nhập
    }
    
    const formData = new FormData();
    formData.append('IdUser', '0'); // Giả sử 0 là ID của bot
    formData.append('Content', message);
    
    return this.http.post(`${this.apiUrl}/addchat`, formData);
  }

  // Gửi tin nhắn đến webhook và nhận phản hồi (luôn gọi bất kể đăng nhập hay chưa)
  sendToWebhook(message: string): Observable<WebhookResponse> {
    return this.http.post<WebhookResponse>(this.webhookUrl, { message }).pipe(
      map(response => {
        // Chuẩn hóa phản hồi để hỗ trợ cả hai định dạng
        if (response.output !== undefined && response.message === undefined) {
          // Chuyển đổi định dạng phản hồi mới sang định dạng cũ
          return { message: response.output };
        }
        return response;
      })
    );
  }
}
