import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, Button,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function App(): JSX.Element {
  const [token, setToken] = useState<string>('');
  const [userInfo, setUserInfo] = useState<any>(null);

  /*
  "expo": "^48.0.0",
  "expo-auth-session": "~4.0.3",
  */

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '527438918447-aqqlsqc2ppac32aoap9d8mucdpld7mlk.apps.googleusercontent.com',
    iosClientId: '527438918447-dsburhe7hgr7mmq0r5vf3vlhasmbm19c.apps.googleusercontent.com',
    expoClientId: '527438918447-p69ka8sj5gfknmfvlisv0s0m359imepg.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      setToken(response.authentication.accessToken);
      getUserInfo();
    }
  }, [response, token]);

  const getUserInfo = async () => {
    try {
      const response = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const user = await response.json();
      setUserInfo(user);
    } catch (error) {
      // Add your own error handler here
    }
  };

  return (
    <View style={styles.container}>
      {userInfo === null ? (
        <Button
          title="Sign in with Google"
          disabled={!request}
          onPress={() => {
            promptAsync();
          }}
        />
      ) : (
        <Text style={styles.text}>{userInfo.name}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
