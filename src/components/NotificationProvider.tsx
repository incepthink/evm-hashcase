"use client";

import React, { useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { notificationEmitter } from "@/utils/notify";

interface NotificationItem {
  id: string;
  message: string;
  severity: "success" | "error" | "info";
  loading: boolean;
  duration: number;
}

export function NotificationProvider() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    return notificationEmitter.subscribe((event) => {
      if (event.type === "show") {
        const item: NotificationItem = {
          id: event.id,
          message: event.message,
          severity: event.severity === "loading" ? "info" : event.severity,
          loading: event.severity === "loading",
          duration: event.duration ?? 4000,
        };
        setNotifications((prev) => [...prev, item]);
      } else if (event.type === "update") {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === event.id
              ? { ...n, message: event.message, severity: event.severity, loading: false }
              : n
          )
        );
      } else if (event.type === "dismiss") {
        setNotifications((prev) => prev.filter((n) => n.id !== event.id));
      }
    });
  }, []);

  const handleClose = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open
          autoHideDuration={notification.loading ? null : notification.duration}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          sx={{ bottom: { xs: 16 + index * 72 }, right: { xs: 16 } }}
        >
          <Alert
            severity={notification.severity}
            onClose={() => handleClose(notification.id)}
            sx={{ display: "flex", alignItems: "center" }}
          >
            {notification.loading && (
              <Box component="span" sx={{ display: "inline-flex", mr: 1, verticalAlign: "middle" }}>
                <CircularProgress size={14} color="inherit" />
              </Box>
            )}
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}
