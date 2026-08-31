import { notificationsList } from '../data/mockData.js';

class NotificationService {
  constructor() {
    try {
      const saved = localStorage.getItem('mobinx_notifications');
      this.notifications = saved ? JSON.parse(saved) : [...notificationsList];
    } catch(e) {
      this.notifications = [...notificationsList];
    }
  }

  addNotification(notif) {
    this.notifications.unshift(notif);
    try {
      localStorage.setItem('mobinx_notifications', JSON.stringify(this.notifications));
    } catch(e) {}
    return notif;
  }

  getAll() {
    return this.notifications;
  }

  getByType(type) {
    if (!type || type === 'all') return this.notifications;
    return this.notifications.filter(n => n.type.toLowerCase() === type.toLowerCase());
  }

  getUnreadCount() {
    return this.notifications.filter(n => n.unread).length;
  }

  markAllAsRead() {
    this.notifications.forEach(n => { n.unread = false; });
    return this.notifications;
  }

  markAsRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.unread = false;
    return notif;
  }
}

export const notificationService = new NotificationService();
