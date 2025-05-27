export interface ChatMessage {
  id?: number;
  content: string;
  isUser: boolean;
  timestamp?: Date;
}

export interface ApiChatRequest {
  IdUser: number;
  Content: string;
}

export interface WebhookResponse {
  message?: string;
  output?: string;
} 