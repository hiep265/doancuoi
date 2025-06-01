import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WebhookResponseType } from '../model/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private webhookUrl = 'http://localhost:5678/webhook/chatmessage';
  
  constructor(private http: HttpClient) { }

  // Gửi tin nhắn đến webhook và nhận phản hồi
  sendToWebhook(message: string): Observable<WebhookResponseType> {
 
    console.log('Sending message to webhook:', message);
    return this.http.post<any>(this.webhookUrl, { message });
   
  }
}
