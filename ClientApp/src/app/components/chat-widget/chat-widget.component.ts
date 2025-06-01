import { Component, ElementRef, OnInit, ViewChild, AfterViewChecked } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { ChatMessage, WebhookResponseType, ArrayResponseItem } from '../../model/chat.model';
import { of } from 'rxjs';
import { catchError, finalize, switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-chat-widget',
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss']
})
export class ChatWidgetComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer: ElementRef;
  
  isMinimized = true;
  messages: ChatMessage[] = [];
  newMessage = '';
  isLoading = false;
  isLoggedIn = false;
  currentUserId: number | null = null;
  welcomeMessage = 'Xin chào bạn cần tìm kiếm sản phẩm gì?';
  errorMessage = 'Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại sau.';
  invalidResponseMessage = 'Không nhận được phản hồi hợp lệ.';
  loadingMessage = 'Đang lấy phản hồi...';
  emptyContentMessage = '(Không có nội dung để hiển thị)';
  inputPlaceholder = 'Nhập tin nhắn...';
  
  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    // Khởi tạo trạng thái mặc định
    this.isLoggedIn = false;
    this.currentUserId = null;
  }
  
  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  // Không còn sử dụng loadChatHistory vì chỉ gọi trực tiếp webhook

  toggleChat(): void {
    this.isMinimized = !this.isMinimized;
    
    if (!this.isMinimized) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || this.isLoading) {
      return;
    }
    
    const messageText = this.newMessage;
    this.newMessage = '';
    this.isLoading = true;
    
    // Thêm tin nhắn người dùng vào giao diện
    const userMessage: ChatMessage = {
      content: messageText,
      isUser: true,
      timestamp: new Date()
    };
    this.messages.push(userMessage);
    
    // Gửi trực tiếp đến webhook
    this.chatService.sendToWebhook(messageText).pipe(
      
      catchError(error => {
        console.error('Error sending to webhook:', error);
        return of({ message: this.errorMessage });
      }),
      
      // Xử lý phản hồi từ webhook
      map(response => {
        // Debug: in ra toàn bộ dữ liệu trả về từ webhook
        console.log('WEBHOOK RESPONSE:', JSON.stringify(response));
       
        // Lấy nội dung trực tiếp từ phản hồi webhook
        let messageContent = '';
        
        // Lấy trực tiếp dữ liệu từ mảng nếu là mảng
        if (Array.isArray(response) && response.length > 0) {
          // Lấy giá trị output từ phần tử đầu tiên của mảng
          const firstItem = response[0] as any;
          console.log('FIRST ITEM:', firstItem);
          
          // Kiểm tra nếu có trường output
          if (firstItem && typeof firstItem === 'object') {
            if (firstItem.output) {
              messageContent = firstItem.output;
              console.log('USING OUTPUT:', messageContent);
            } else {
              // Nếu không có trường output, thử lấy toàn bộ phần tử nếu nó là chuỗi
              messageContent = typeof firstItem === 'string' ? firstItem : JSON.stringify(firstItem);
              console.log('USING STRINGIFIED ITEM:', messageContent);
            }
          } else {
            messageContent = String(firstItem);
            console.log('USING STRING CONVERSION:', messageContent);
          }
        } 
        // Nếu không phải mảng thì gán trực tiếp
        else {
          // Các trường hợp còn lại, gán trực tiếp giá trị
          const resp = response as any;
          console.log('NON-ARRAY RESPONSE:', resp);
          
          if (resp && typeof resp === 'object') {
            if (resp.output) {
              messageContent = resp.output;
              console.log('USING OBJECT OUTPUT:', messageContent);
            } else if (resp.message) {
              messageContent = resp.message;
              console.log('USING OBJECT MESSAGE:', messageContent);
            } else {
              // Thử chuyển thành chuỗi
              messageContent = JSON.stringify(resp);
              console.log('USING STRINGIFIED OBJECT:', messageContent);
            }
          } else if (typeof resp === 'string') {
            // Nếu là chuỗi, sử dụng trực tiếp
            messageContent = resp;
            console.log('USING STRING DIRECTLY:', messageContent);
          } else {
            messageContent = String(resp) || this.invalidResponseMessage;
            console.log('USING STRING CONVERSION OR DEFAULT:', messageContent);
          }
        }
        
        // Thêm phản hồi vào giao diện
        const botMessage: ChatMessage = {
          content: messageContent,
          isUser: false,
          timestamp: new Date()
        };
        this.messages.push(botMessage);
        
        // Trả về giá trị để tiếp tục chuỗi observable
        return messageContent;
      }),
      finalize(() => {
        this.isLoading = false;
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
      })
    )
    .subscribe(
      () => {},
      (error) => {
        console.error('Error in chat process:', error);
      }
    );
  }
  
  private scrollToBottom(): void {
    if (this.scrollContainer) {
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error('Error scrolling to bottom:', err);
      }
    }
  }
}
