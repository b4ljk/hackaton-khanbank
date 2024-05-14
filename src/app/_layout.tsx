/* eslint-disable react/react-in-jsx-scope */
import { useReactNavigationDevTools } from '@dev-plugins/react-navigation';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack, useNavigationContainerRef } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { StyleSheet, View } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { APIProvider } from '@/api';
import { hydrateAuth, loadSelectedTheme } from '@/core';
import { useThemeConfig } from '@/core/use-theme-config';

export { ErrorBoundary } from 'expo-router';

// Import  global CSS file
import '../../global.css';

import { Image, Text } from '@/ui';

export const unstable_settings = {
  initialRouteName: '(app)',
};

hydrateAuth();
loadSelectedTheme();
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const navigationRef = useNavigationContainerRef();
  useReactNavigationDevTools(navigationRef);
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <Providers>
      <Drawer
        screenOptions={{
          drawerContentContainerStyle: {
            flex: 1,
            justifyContent: 'center',
          },
          headerLeft: () => (
            <View style={{ paddingHorizontal: 12 }}>
              <Image
                source={require('@assets/khanlogo.png')}
                style={{ height: 35, width: 183 }}
                // className="h-full w-full"
              />
            </View>
          ),
        }}
      >
        <Drawer.Screen
          name="audio"
          options={{
            headerTitle: '',
            title: 'Audio',
          }}
        />
        <Drawer.Screen
          name="loan"
          options={{
            headerTitle: '',
            title: 'Зээл тооцогч',
          }}
        />
      </Drawer>
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();
  return (
    <GestureHandlerRootView
      style={styles.container}
      className={theme.dark ? `dark` : undefined}
    >
      <ThemeProvider value={theme}>
        <APIProvider>
          <BottomSheetModalProvider>
            {children}
            <FlashMessage position="top" />
          </BottomSheetModalProvider>
        </APIProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
