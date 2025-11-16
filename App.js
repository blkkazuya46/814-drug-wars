import React from 'react';
import { SafeAreaView, StatusBar, Platform } from 'react-native';
import Constants from 'expo-constants';
import { WebView } from 'react-native-webview';

export default function App() {
  const DRUG_WARS_URL = 'https://814-drug-wars-bay.vercel.app';

  const topPadding = Platform.OS === 'android' ? Constants.statusBarHeight : 0;

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: topPadding, backgroundColor: '#000' }}>
      <StatusBar barStyle="light-content" />
      <WebView
        source={{ uri: DRUG_WARS_URL }}
        style={{ flex: 1 }}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        allowsBackForwardNavigationGestures
      />
    </SafeAreaView>
  );
}
