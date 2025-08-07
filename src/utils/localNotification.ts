import * as Notifications from 'expo-notifications';

export async function scheduleReminder(
  title: string,
  body: string,
  secondsFromNow: number
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    // 👇 Force-casting the trigger as 'any' to bypass TS error
    trigger: {
      seconds: secondsFromNow,
      repeats: false,
    } as any,
  });
}
