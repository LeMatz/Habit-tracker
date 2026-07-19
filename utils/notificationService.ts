import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// Stable id for the single daily reminder so we can reschedule/cancel it.
const DAILY_REMINDER_ID = 1001;

const isNative = () => Capacitor.isNativePlatform();

/**
 * Ask the user for notification permission.
 * Native: uses the OS permission dialog (Android 13+ POST_NOTIFICATIONS).
 * Web: uses the browser Notification API.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (isNative()) {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  }
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function getPermissionState(): Promise<boolean> {
  if (isNative()) {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted';
  }
  if (!('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

/**
 * Schedule (or reschedule) a repeating daily reminder at HH:MM.
 * Native only — schedules an OS-level notification that fires even when the
 * app is closed. On web this is a no-op (the app polls while open instead).
 */
export async function scheduleDailyReminder(
  reminderTime: string,
  title: string,
  body: string,
): Promise<void> {
  if (!isNative()) return;

  const [hourStr, minuteStr] = reminderTime.split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return;

  // Clear any previously scheduled reminder before scheduling the new one.
  await cancelDailyReminder();

  await LocalNotifications.schedule({
    notifications: [
      {
        id: DAILY_REMINDER_ID,
        title,
        body,
        schedule: {
          on: { hour, minute },
          allowWhileIdle: true,
        },
      },
    ],
  });
}

export async function cancelDailyReminder(): Promise<void> {
  if (!isNative()) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: DAILY_REMINDER_ID }] });
  } catch {
    // Nothing scheduled — safe to ignore.
  }
}

/**
 * Fire an immediate notification (used by the "test notification" button).
 * Native: shows a real OS notification a moment from now.
 * Web: uses the browser Notification API.
 */
export async function sendImmediateNotification(title: string, body: string): Promise<void> {
  if (isNative()) {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.floor(Math.random() * 100000) + 2000,
          title,
          body,
          schedule: { at: new Date(Date.now() + 1000) },
        },
      ],
    });
    return;
  }
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

export { isNative };
