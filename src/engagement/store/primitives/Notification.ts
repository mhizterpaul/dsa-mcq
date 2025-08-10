export class Notification {
  id: string;
  userId: string;
  message: string;
  type: 'reminder' | 'nudge';
  isRead: boolean;
  createdAt: number;
  sendAt: number;

  constructor(id: string, userId: string, message: string, type: 'reminder' | 'nudge', sendAt: number) {
    this.id = id;
    this.userId = userId;
    this.message = message;
    this.type = type;
    this.isRead = false;
    this.createdAt = Date.now();
    this.sendAt = sendAt;
  }

  markAsRead() {
    this.isRead = true;
  }
}
