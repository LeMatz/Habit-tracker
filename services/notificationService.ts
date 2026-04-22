import * as Notifications from 'expo-notifications';

const REMINDER_ID = 'daily_habit_reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  requestPermissions: async (): Promise<boolean> => {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  },

  scheduleDailyReminder: async (reminderTime: string, habitName: string): Promise<void> => {
    const [hourStr, minuteStr] = reminderTime.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return;

    await notificationService.cancelDailyReminder();

    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: {
        title: 'Hábito diario',
        body: habitName ? `Recordatorio: ${habitName}` : 'No olvides tu check-in de hoy',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      } as Notifications.DailyTriggerInput,
    });
  },

  cancelDailyReminder: async (): Promise<void> => {
    try {
      await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
    } catch {
      // Identifier may not exist yet — safe to ignore
    }
  },

  sendTest: async (): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Prueba',
        body: 'Las notificaciones están funcionando',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      } as Notifications.TimeIntervalTriggerInput,
    });
  },
};
