
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { NotificationItem } from '../types';
import { playSfx } from '../utils/audio';

interface NotificationContextType {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
      {
          id: 'mail-gift',
          type: 'pet',
          title: '初次见面，请多多关照',
          message: '这个网页，是我为你准备的礼物',
          timestamp: Date.now(),
          read: false
      },
      {
          id: 'sys-welcome',
          type: 'info',
          title: '系统已上线',
          message: '欢迎来到无名次元 v3.2',
          timestamp: Date.now(),
          read: false
      }
  ]);

  const addNotification = useCallback((notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: Date.now().toString() + Math.random().toString().slice(2),
      timestamp: Date.now(),
      read: false
    };
    
    // Limit to 20 notifications to prevent clutter
    setNotifications(prev => [newNotif, ...prev].slice(0, 20));
    
    // Play sound based on type
    if (notif.type === 'achievement') playSfx('success');
    else if (notif.type === 'pet') playSfx('pet-happy');
    else playSfx('pop');
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
     setNotifications([]);
     playSfx('delete');
  }, []);

  const removeNotification = useCallback((id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
      playSfx('click');
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllAsRead, clearAll, removeNotification, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
