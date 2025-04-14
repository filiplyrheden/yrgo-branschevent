import React, { useState, useEffect, createContext, useContext } from "react";
import styled, { keyframes } from "styled-components";

// Create a context for the notification system
const NotificationContext = createContext();

// Animation for notification entry
const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Animation for notification exit
const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-20px);
    opacity: 0;
  }
`;

// Styled container for all notifications
const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
`;

// Styled individual notification
const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-radius: 4px;
  color: #fff;
  background-color: ${(props) => {
    switch (props.type) {
      case "success":
        return "#28a745";
      case "error":
        return "var(--Primary-Red)";
      case "info":
        return "var(--Primary-Red)";
      default:
        return "#001A52";
    }
  }};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: ${(props) => (props.isExiting ? slideOut : slideIn)} 0.3s ease-in-out;
  position: relative;
`;

// Content of the notification
const NotificationContent = styled.div`
  flex: 1;
`;

// Title of the notification
const NotificationTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-family: var(--Font-Inter);
  font-weight: 600;
`;

// Message of the notification
const NotificationMessage = styled.p`
  margin: 0;
  font-size: 14px;
  font-family: var(--Font-Inter);
  color: #fff;
`;

// Close button
const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #fff;
  font-size: 20px;
  line-height: 1;
  margin-left: 12px;
  padding: 0;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover, &:focus {
    opacity: 1;
  }
  
  /* Improved focus indication for accessibility */
  &:focus {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }
  
  /* Larger clickable area for better touch usability */
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Provider component that manages notifications
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Function to add a notification
  const addNotification = (notification) => {
    const id = Math.random().toString(36).substring(2, 11);
    const newNotification = {
      id,
      type: notification.type || "info",
      title: notification.title || "",
      message: notification.message,
      duration: notification.duration || 3000, // Default 3 seconds
      isExiting: false,
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove after duration (if not 0, which means it stays until manually closed)
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    // Announce to screen readers
    if (notification.message) {
      announceNotification(`${notification.type}: ${notification.title} ${notification.message}`);
    }

    return id;
  };

  // Helper function for screen reader announcements
  const announceNotification = (message) => {
    const announcement = document.getElementById("notification-live-region");
    if (announcement) {
      announcement.textContent = message;
    }
  };

  // Function to start the removal animation
  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, isExiting: true } : notification
      )
    );

    // Actually remove after animation completes
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }, 300); // Match animation duration
  };

  // Provide the notification context
  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      <NotificationContainer role="log" aria-live="polite">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            type={notification.type}
            isExiting={notification.isExiting}
            role="alert"
          >
            <NotificationContent>
              {notification.title && (
                <NotificationTitle>{notification.title}</NotificationTitle>
              )}
              <NotificationMessage>{notification.message}</NotificationMessage>
            </NotificationContent>
            <CloseButton
              onClick={() => removeNotification(notification.id)}
              aria-label="Stäng notifiering"
            >
              ×
            </CloseButton>
          </NotificationItem>
        ))}
      </NotificationContainer>
      {/* Hidden element for screen reader announcements */}
      <div 
        id="notification-live-region" 
        aria-live="assertive" 
        aria-atomic="true" 
        style={{ 
          position: 'absolute', 
          width: '1px', 
          height: '1px', 
          margin: '-1px',
          padding: 0,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0
        }}
      />
    </NotificationContext.Provider>
  );
};

// Hook to use the notification system
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

// Usage example functions
export const showSuccessNotification = (message, title = "Lyckades!", duration = 5000) => {
  const { addNotification } = useNotification();
  return addNotification({
    type: "success",
    title,
    message,
    duration,
  });
};

export const showErrorNotification = (message, title = "Ett fel uppstod", duration = 7000) => {
  const { addNotification } = useNotification();
  return addNotification({
    type: "error",
    title,
    message,
    duration,
  });
};

export const showInfoNotification = (message, title = "Information", duration = 5000) => {
  const { addNotification } = useNotification();
  return addNotification({
    type: "info",
    title,
    message,
    duration,
  });
};