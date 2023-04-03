import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [token, setToken] = useState('');
  const [userInfo, setUserInfo] = useState(null);

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

/*
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet, Text, View, Image, Button, Platform,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

export default function App() {
  const [userInfo, setUserInfo] = useState();
  const [auth, setAuth] = useState();
  const [requireRefresh, setRequireRefresh] = useState(false);
  // let redirectUri = "com.tripvisor.authsessiongoogle://expo-development-client/?url=https://u.expo.dev/cd57c206-baac-4c10-b9a2-4a968049c187?channel-name=main";
  const redirectUri = 'https://u.expo.dev/cd57c206-baac-4c10-b9a2-4a968049c187?channel-name=main?runtime-version=2.718';

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '527438918447-aqqlsqc2ppac32aoap9d8mucdpld7mlk.apps.googleusercontent.com',
    iosClientId: '527438918447-dsburhe7hgr7mmq0r5vf3vlhasmbm19c.apps.googleusercontent.com',
    expoClientId: '527438918447-p69ka8sj5gfknmfvlisv0s0m359imepg.apps.googleusercontent.com',
    redirectUri,
  });

  useEffect(() => {
    console.log(response);
    if (response?.type === 'success') {
      setAuth(response.authentication);

      const persistAuth = async () => {
        await AsyncStorage.setItem('auth', JSON.stringify(response.authentication));
      };
      persistAuth();
    }
  }, [response]);

  useEffect(() => {
    const getPersistedAuth = async () => {
      const jsonValue = await AsyncStorage.getItem('auth');
      if (jsonValue != null) {
        const authFromJson = JSON.parse(jsonValue);
        setAuth(authFromJson);
        console.log(authFromJson);

        setRequireRefresh(!AuthSession.TokenResponse.isTokenFresh({
          expiresIn: authFromJson.expiresIn,
          issuedAt: authFromJson.issuedAt,
        }));
      }
    };
    getPersistedAuth();
  }, []);

  const getUserData = async () => {
    const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });

    userInfoResponse.json().then((data) => {
      console.log(data);
      setUserInfo(data);
    });
  };

  const showUserData = () => {
    if (userInfo) {
      return (
        <View style={styles.userInfo}>
          <Image source={{ uri: userInfo.picture }} style={styles.profilePic} />
          <Text>
            Welcome
            {' '}
            {userInfo.name}
          </Text>
          <Text>{userInfo.email}</Text>
        </View>
      );
    }
  };

  const getClientId = () => {
    if (Platform.OS === 'ios') {
      return '527438918447-dsburhe7hgr7mmq0r5vf3vlhasmbm19c.apps.googleusercontent.com';
    } if (Platform.OS === 'android') {
      return '527438918447-aqqlsqc2ppac32aoap9d8mucdpld7mlk.apps.googleusercontent.com';
    }
    console.log('Invalid platform - not handled');
  };

  const refreshToken = async () => {
    const clientId = getClientId();
    console.log(auth);
    const tokenResult = await AuthSession.refreshAsync({
      clientId,
      refreshToken: auth.refreshToken,
    }, {
      tokenEndpoint: 'https://www.googleapis.com/oauth2/v4/token',
    });

    tokenResult.refreshToken = auth.refreshToken;

    setAuth(tokenResult);
    await AsyncStorage.setItem('auth', JSON.stringify(tokenResult));
    setRequireRefresh(false);
  };

  if (requireRefresh) {
    return (
      <View style={styles.container}>
        <Text>Token requires refresh...</Text>
        <Button title="Refresh Token" onPress={refreshToken} />
      </View>
    );
  }

  const logout = async () => {
    await AuthSession.revokeAsync({
      token: auth.accessToken,
    }, {
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    });

    setAuth(undefined);
    setUserInfo(undefined);
    await AsyncStorage.removeItem('auth');
  };

  return (
    <View style={styles.container}>
      {showUserData()}
      <Button
        title={auth ? 'Get User Data' : 'Login'}
        onPress={auth ? getUserData : () => promptAsync({ useProxy: false, showInRecents: true })}
      />
      {auth ? <Button title="Logout" onPress={logout} /> : undefined}
      <StatusBar style="auto" />
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
  profilePic: {
    width: 50,
    height: 50,
  },
  userInfo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
*/

/*
import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [accessToken, setAccessToken] = React.useState();
  const [userInfo, setUserInfo] = React.useState();
  const [message, setMessage] = React.useState();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '527438918447-aqqlsqc2ppac32aoap9d8mucdpld7mlk.apps.googleusercontent.com',
    iosClientId: '527438918447-dsburhe7hgr7mmq0r5vf3vlhasmbm19c.apps.googleusercontent.com',
    expoClientId: '527438918447-p69ka8sj5gfknmfvlisv0s0m359imepg.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    setMessage(JSON.stringify(response));
    if (response?.type === 'success') {
      const { authentication } = response;
      // setData(authentication);
      // console.log(data);
      setAccessToken(response.authentication.accessToken);
    }
  }, [response]);

  async function getUserData() {
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/userinfo/v2/me',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    userInfoResponse
      .json()
      .then((data) => {
        setUserInfo(data);
      })
      .then(() => console.log(userInfo));
  }

  function showUserInfo() {
    if (userInfo) {
      return (
        <View style={styles.userInfo}>
          <Image source={{ uri: userInfo.picture }} style={styles.profilePic} />
          <Text>
            Welcome
            {' '}
            {userInfo.name}
          </Text>
          <Text>{userInfo.email}</Text>
        </View>
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {showUserInfo()}
      <Button
        disabled={!request}
        title={accessToken ? 'Get User Data' : 'Login'}
        onPress={
          accessToken
            ? getUserData
            : () => {
              promptAsync({ proxyOptions: { isTripleSlashed: true } });
            }
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePic: {
    width: 50,
    height: 50,
  },
});
*/
