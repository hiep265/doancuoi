import { Component, ElementRef, OnInit, ViewChild, AfterViewChecked } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../model/chat.model';
import { of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';

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
  
  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    // Kiểm tra trạng thái đăng nhập
    this.isLoggedIn = this.chatService.isUserLoggedIn();
    this.currentUserId = this.chatService.getCurrentUserId();
    
    // Chỉ tải lịch sử chat khi đã đăng nhập
    if (this.isLoggedIn) {
      this.loadChatHistory();
    }
    
    // Nếu cần, có thể theo dõi sự thay đổi của trạng thái đăng nhập ở đây
  }
  
  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  
  loadChatHistory(): void {
    this.chatService.getChats().subscribe(
      (chats) => {
        if (chats && chats.length > 0) {
          this.messages = chats.map(chat => ({
            content: chat.ContentChat,
            isUser: chat.IdUser !== 0, // Giả sử 0 là ID của bot
            timestamp: new Date(chat.TimeChat)
          }));
          
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        }
      },
      (error) => {
        console.error('Error loading chat history:', error);
      }
    );
  }

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
    
    // Thêm tin nhắn người dùng vào giao diện (luôn hiển thị bất kể đăng nhập hay chưa)
    const userMessage: ChatMessage = {
      content: messageText,
      isUser: true,
      timestamp: new Date()
    };
    this.messages.push(userMessage);
    
    // Lưu tin nhắn người dùng vào database (chỉ khi đã đăng nhập)
    const saveUserMsg$ = this.isLoggedIn && this.currentUserId 
      ? this.chatService.saveUserMessage(this.currentUserId, messageText)
      : of(null);
    
    saveUserMsg$.pipe(
      // Luôn gửi đến webhook bất kể đăng nhập hay chưa
      switchMap(() => {
        return this.chatService.sendToWebhook(messageText);
      }),
      catchError(error => {
        console.error('Error sending to webhook:', error);
        return of({ message: 'Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại sau.' });
      }),
      // Xử lý phản hồi từ webhook
      switchMap(response => {
        // Thêm phản hồi vào giao diện (luôn hiển thị)
        const botMessage: ChatMessage = {
          content: response.message,
          isUser: false,
          timestamp: new Date()
        };
        this.messages.push(botMessage);
        
        // Lưu phản hồi vào database (chỉ khi đã đăng nhập)
        return this.isLoggedIn 
          ? this.chatService.saveBotMessage(response.message)
          : of(null);
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
