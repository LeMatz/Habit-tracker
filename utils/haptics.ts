
export const haptics = {
  // Ultra light tap for selections
  selection: () => {
    if ('vibrate' in navigator) navigator.vibrate(5);
  },
  // Light feedback for minor actions
  light: () => {
    if ('vibrate' in navigator) navigator.vibrate(15);
  },
  // Medium feedback for standard buttons
  medium: () => {
    if ('vibrate' in navigator) navigator.vibrate(30);
  },
  // Heavy feedback for important actions (spending points)
  heavy: () => {
    if ('vibrate' in navigator) navigator.vibrate(60);
  },
  // Success pattern (double pulse)
  success: () => {
    if ('vibrate' in navigator) navigator.vibrate([10, 40, 10]);
  },
  // Error/Warning pattern
  error: () => {
    if ('vibrate' in navigator) navigator.vibrate([50, 50, 50]);
  }
};
