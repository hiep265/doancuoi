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

export interface ArrayResponseItem {
  output?: string;
}

// Union type cho tất cả các loại phản hồi có thể nhận được
export type WebhookResponseType = WebhookResponse | ArrayResponseItem[] | { message: string; };