import { useState } from 'react';
import {
  useMyNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead
} from '../../hooks/useNotification';
import './NotificationsListPage.css';

export default function NotificationsListPage() {
  const [page, setPage] = useState(1);
  const [channelFilter, setChannelFilter] = useState('ALL');

  const { data: notificationsPaged, isLoading, error } = useMyNotifications(page);
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const handleMarkRead = (notificationId) => {
    markReadMutation.mutate(notificationId);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="notifications-page-container">
        <div className="spinner-container">
          <div className="spinner"></div>
          <span>Fetching notification logs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-page-container">
        <div className="error-message">
          Failed to load notifications: {error.message}
        </div>
      </div>
    );
  }

  const items = notificationsPaged?.data?.items || [];
  const totalCount = notificationsPaged?.data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / 10) || 1;

  // Filter items client-side
  const filteredItems = items.filter((item) => {
    if (channelFilter === 'ALL') return true;
    return item.channel.toUpperCase() === channelFilter;
  });

  const getChannelIcon = (channel) => {
    switch (channel.toUpperCase()) {
      case 'EMAIL': return '✉️';
      case 'SMS': return '💬';
      case 'PUSH': return '🔔';
      default: return '📢';
    }
  };

  const formatTime = (dateTimeStr) => {
    const d = new Date(dateTimeStr);
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasUnread = items.some((i) => !i.isRead && i.channel === 'Push');

  return (
    <div className="notifications-page-container">
      <header className="page-header">
        <div>
          <h1>Alert Notification Hub</h1>
          <p className="subtitle">View delivered dispatch slips, email notices, and live queue bells.</p>
        </div>
        {hasUnread && (
          <button
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
            className="btn-read-all"
          >
            {markAllReadMutation.isPending ? 'Processing...' : '✓ Mark All Read'}
          </button>
        )}
      </header>

      {/* Filter and stats controls bar */}
      <div className="notifications-controls-bar">
        <div className="channel-filter-group">
          <button
            onClick={() => setChannelFilter('ALL')}
            className={`btn-filter ${channelFilter === 'ALL' ? 'active' : ''}`}
          >
            All Channels
          </button>
          <button
            onClick={() => setChannelFilter('PUSH')}
            className={`btn-filter ${channelFilter === 'PUSH' ? 'active' : ''}`}
          >
            🔔 In-App Alerts
          </button>
          <button
            onClick={() => setChannelFilter('EMAIL')}
            className={`btn-filter ${channelFilter === 'EMAIL' ? 'active' : ''}`}
          >
            ✉️ Email Logs
          </button>
          <button
            onClick={() => setChannelFilter('SMS')}
            className={`btn-filter ${channelFilter === 'SMS' ? 'active' : ''}`}
          >
            💬 SMS Receipts
          </button>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>
          Showing {filteredItems.length} of {totalCount} records
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-notifications-state">
          <span className="bell-icon">🔔</span>
          <h3>Inbox is Empty</h3>
          <p>No notifications match your current selection filter.</p>
        </div>
      ) : (
        <div className="notification-items-list">
          {filteredItems.map((item) => {
            const isUnreadPush = !item.isRead && item.channel === 'Push';
            return (
              <div
                key={item.notificationId}
                className={`notification-item-card ${isUnreadPush ? 'unread' : 'read'}`}
              >
                <div className="notification-icon-wrapper">
                  {getChannelIcon(item.channel)}
                </div>
                
                <div className="notification-item-content">
                  <div className="notification-item-header">
                    <h3 className="notification-item-title">{item.title}</h3>
                    <div className="notification-item-meta">
                      <span className={`notification-channel-badge ${item.channel.toLowerCase()}`}>
                        {item.channel}
                      </span>
                      <span className="notification-item-time">
                        {formatTime(item.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="notification-item-body">{item.body}</p>
                </div>

                {isUnreadPush && (
                  <button
                    onClick={() => handleMarkRead(item.notificationId)}
                    disabled={markReadMutation.isPending}
                    className="btn-mark-item-read"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="notifications-pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-paginate"
          >
            Previous
          </button>
          <span className="paginate-info">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-paginate"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
