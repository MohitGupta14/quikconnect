// types/chat.ts
export interface Message {
    message: string;
    sender: string;
    timestamp: Date;
    roomId: string;
  }
  
  export interface ServerToClientEvents {
    'receive-message': (data: Message) => void;
    'previous-messages': (messages: Message[]) => void;
  }
  
  export interface ClientToServerEvents {
    'join-room': (roomId: string) => void;
    'send-message': (data: Omit<Message, 'timestamp'>) => void;
  }