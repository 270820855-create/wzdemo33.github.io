
import React, { useEffect, useState } from 'react';
import { X, Bell, Trash2, Check, Info, Heart, Trophy, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { NotificationItem } from '../types';
import { playSfx } from '../utils/audio';
import { useLanguage } from '../contexts/LanguageContext';

interface NotificationsPanelProps {
  onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const { notifications, markAllAsRead, clearAll, removeNotification } = useNotification();
  const [filter, setFilter] = useState<'ALL' | 'PET' | 'SYSTEM'>('ALL');

  // Mark all as read when opening panel
  useEffect(() => {
    const timer = setTimeout(() => {
        markAllAsRead();
    }, 1000);
    return () => clearTimeout(timer);
  }, [markAllAsRead]);

  const filteredNotifications = notifications.filter(n => {
      if (filter === 'ALL') return true;
      if (filter === 'PET') return n.type === 'pet';
      if (filter === 'SYSTEM') return n.type !== 'pet';
      return true;
  });

  const getIcon = (type: NotificationItem['type']) => {
      switch (type) {
          case 'pet': return <Heart size={16} className="text-white" />;
          case 'achievement': return <Trophy size={16} className="text-white" />;
          case 'warning': return <AlertTriangle size={16} className="text-black" />;
          case 'success': return <Check size={16} className="text-white" />;
          default: return <Info size={16} className="text-black" />;
      }
  };

  const getColor = (type: NotificationItem['type']) => {
      switch (type) {
          case 'pet': return 'bg-jinx-pink border-black';
          case 'achievement': return 'bg-yellow-400 border-black';
          case 'warning': return 'bg-orange-400 border-black';
          case 'success': return 'bg-green-500 border-black';
          default: return 'bg-white border-black';
      }
  };

  return (
    <>
    {/* Transparent Backdrop to handle clicks outside */}
    <div className="fixed inset-0 z-[45]" onClick={onClose} />

    <div className="fixed top-24 right-4 left-4 md:left-auto md:right-8 md:w-96 z-[50] animate-cloth-unfold origin-top-right">
       {/* Decor triangle connector */}
       <div className="absolute -top-3 right-5 w-6 h-6 bg-white border-t-[3px] border-l-[3px] border-black transform rotate-45 z-50"></div>

       <div className="bg-white border-[3px] border-black shadow-[8px_8px_0_rgba(0,0,0,1)] flex flex-col max-h-[75vh] relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col border-b-[3px] border-black bg-gray-50">
             <div className="flex items-center justify-between p-3">
                 <div className="flex items-center gap-2">
                     <Bell size={20} strokeWidth={2.5} className="text-black" />
                     <span className="font-anime font-black text-xl tracking-wide uppercase">{t('notifications.inbox')}</span>
                     {notifications.length > 0 && (
                         <span className="text-xs font-mono bg-jinx-pink text-white border border-black px-1.5 rounded shadow-[2px_2px_0_#000]">
                            {notifications.length}
                         </span>
                     )}
                 </div>
                 <button 
                    onClick={() => { onClose(); playSfx('click'); }}
                    className="p-1.5 hover:bg-black hover:text-white rounded border-2 border-transparent hover:border-black transition-all"
                 >
                    <X size={20} strokeWidth={3} />
                 </button>
             </div>
             
             {/* Filter Tabs */}
             <div className="flex px-3 pb-3 gap-2 text-xs font-bold font-mono">
                 {(['ALL', 'PET', 'SYSTEM'] as const).map((f) => (
                     <button
                        key={f}
                        onClick={() => { setFilter(f); playSfx('pop'); }}
                        className={`
                            flex-1 py-1.5 border-2 border-black transition-all active:translate-y-0.5
                            ${filter === f 
                                ? 'bg-black text-white shadow-[2px_2px_0_#CCFF00]' 
                                : 'bg-white text-black hover:bg-gray-100'
                            }
                        `}
                     >
                        {t(`notifications.${f.toLowerCase()}`)}
                     </button>
                 ))}
             </div>
          </div>

          {/* List Content */}
          <div className="overflow-y-auto p-3 space-y-3 scrollbar-hide bg-scribble min-h-[200px]">
             {filteredNotifications.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-8 font-anime gap-2">
                     <Bell size={48} strokeWidth={1.5} className="text-gray-400" />
                     <div>
                         <p className="text-xl font-black uppercase">{t('notifications.empty')}</p>
                         <p className="text-xs font-mono">{t('notifications.emptySub')}</p>
                     </div>
                 </div>
             ) : (
                 filteredNotifications.map((item) => (
                     <div 
                        key={item.id} 
                        className={`
                            relative group flex gap-3 p-3 border-[2px] border-black bg-white transition-all 
                            hover:shadow-[4px_4px_0_#000] hover:-translate-y-0.5
                            ${!item.read ? 'bg-blue-50/50' : ''}
                        `}
                     >
                        {/* Icon Box */}
                        <div className={`
                            w-10 h-10 shrink-0 flex items-center justify-center border-2 shadow-[2px_2px_0_rgba(0,0,0,1)]
                            ${getColor(item.type)}
                        `}>
                            {getIcon(item.type)}
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex justify-between items-start">
                                <h4 className="font-anime font-black text-sm leading-none mb-1">{item.title}</h4>
                                <span className="text-[9px] font-mono text-gray-400 whitespace-nowrap ml-2">
                                    {new Date(item.timestamp).getHours()}:{String(new Date(item.timestamp).getMinutes()).padStart(2, '0')}
                                </span>
                            </div>
                            <p className="font-mono text-xs text-gray-600 leading-snug break-words line-clamp-2">{item.message}</p>
                        </div>

                        {/* Quick Delete */}
                        <button 
                            /* Fix: Access item.id instead of non-existent id */
                            onClick={(e) => { e.stopPropagation(); removeNotification(item.id); }}
                            className="absolute -top-2 -right-2 bg-white text-red-500 border-2 border-black p-1 rounded-full opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-red-500 hover:text-white transition-all shadow-sm z-10"
                            title="Dismiss"
                        >
                            <X size={10} strokeWidth={3} />
                        </button>
                     </div>
                 ))
             )}
          </div>
          
          {/* Footer Actions */}
          {notifications.length > 0 && (
              <div className="p-3 border-t-[3px] border-black bg-white flex gap-3">
                  <button 
                    onClick={() => { markAllAsRead(); playSfx('click'); }}
                    className="flex-1 py-2 border-2 border-black bg-white hover:bg-neon-green font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-[2px_2px_0_#000] active:translate-y-0.5 active:shadow-none"
                  >
                     <CheckCircle size={14} /> {t('notifications.markRead')}
                  </button>
                  <button 
                    onClick={() => { clearAll(); }}
                    className="flex-1 py-2 border-2 border-black bg-white hover:bg-red-500 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-[2px_2px_0_#000] active:translate-y-0.5 active:shadow-none"
                  >
                     <Trash2 size={14} /> {t('notifications.clearAll')}
                  </button>
              </div>
          )}
       </div>
    </div>
    </>
  );
};

export default NotificationsPanel;
