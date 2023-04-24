import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Pressable, Text, View, Button, Image, useColorScheme,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { NavigationContainer } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CAR_IMAGE from './assets/TravelCar.png';
import GOOG_IMAGE from './assets/google-logo.png';
import { RootStackParamList } from './RootStackParams';

WebBrowser.maybeCompleteAuthSession();

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

type Props = {
  navigation: ProfileScreenNavigationProp;
};

function Auth({ navigation }: Props) {
  const isDarkMode = useColorScheme() === 'dark';
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
    if (token !== '') {
      navigation.navigate('Routes', { name: 'Jane' });
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

    <View style={[
      styles.container,
      {
        backgroundColor: isDarkMode ? '#55596D' : '#D6DAEA',
      },
    ]}
    >
      {userInfo === null ? (

        <View style={styles.box}>
          <Text style={styles.title}>Sign in with</Text>
          <Image source={CAR_IMAGE} style={styles.car} />
          <Image source={GOOG_IMAGE} style={styles.google} />
          <Button
            title=""
            disabled={!request}
            onPress={() => {
              promptAsync();
            }}
          />

        </View>
      ) : (
        <View style={styles.box}>
          <Text style={styles.text}>{userInfo.name}</Text>
          <Pressable
            style={[
              styles.button,
              {
                backgroundColor: isDarkMode ? '#55596D' : '#D6DAEA',
                // color: isDarkMode ? Colors.black : Colors.white,
              },
            ]}
            onPress={() => navigation.navigate('Routes', { name: 'Jane' })}
          >
            <Text style={styles.buttonText}>Continue to Maps</Text>
          </Pressable>
          <Pressable
            style={[
              styles.button,
              {
                backgroundColor: isDarkMode ? '#55596D' : '#D6DAEA',
                // color: isDarkMode ? Colors.black : Colors.white,
              },
            ]}
            onPress={() => setUserInfo(null)}
          >
            <Text style={styles.buttonText}>Log Out</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    position: 'absolute',
    textAlign: 'center',
    width: 350,
    fontSize: 60,
    // marginLeft: '10%',
    marginTop: '-60%',
    fontWeight: 'bold',
    color: 'white',
  },
  box: {
    backgroundColor: '#fff',
    width: 350,
    height: 250,
    borderRadius: 25,
    textAlign: 'center',
    alignContent: 'center',
    paddingTop: '25%',
  },
  car: {
    position: 'absolute',
    width: 380,
    height: 395,
    marginLeft: -12,
  },
  google: {
    position: 'absolute',
    width: 200,
    height: 65,
    marginLeft: 76,
    marginTop: 82,
  },
  button: {
    maxWidth: '70%',
    marginLeft: '15%',
    top: '70%',
    bottom: '10%',
    fontSize: 24,
    // cursor: 'pointer',
    textAlign: 'center',
    // textDecoration: 'none',
    // add border
    borderColor: '#133F50',
    borderWidth: 3,
    margin: 4,

    // color: '#fff',
    // backgroundColor: '#133F50',
    border: 'none',
    borderRadius: 25,
    boxShadow: '0 9px #999',
  },
  buttonText: {
    textAlign: 'center',
    // color: 'white',
    margin: 22,
    fontSize: 24,
  },
});

export default Auth;
