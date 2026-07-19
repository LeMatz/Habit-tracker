import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sistemashce.sistemashce',
  appName: 'Sistema SHCE',
  webDir: 'dist',
  backgroundColor: '#020617',
  android: {
    // Allow http during local dev live-reload only; production uses bundled https assets.
    allowMixedContent: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#06b6d4',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#020617',
    },
  },
};

export default config;
