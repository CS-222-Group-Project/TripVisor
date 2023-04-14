import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, Button, Image, useColorScheme,
} from 'react-native';
import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { DefaultAzureCredential } from '@azure/identity';
import { CosmosClient } from '@azure/cosmos';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CAR_IMAGE from './assets/TravelCar.png';
import GOOG_IMAGE from './assets/google-logo.png';

WebBrowser.maybeCompleteAuthSession();

export default function App(): JSX.Element {
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
      storeUserInfo();
    } catch (error) {
      // Add your own error handler here
    }
  };

  const storeUserInfo = async () => {
    // store user info in the database
    try {
      const endpoint = 'https://trip-visor.documents.azure.com:443/';
      const cosmosClient = new CosmosClient({
        endpoint,
        aadCredentials: new DefaultAzureCredential(),
      });
      const databaseId = 'Users';
      const containerId = 'user-id';
      const container = cosmosClient.database(databaseId).container(containerId);

      // check if user already exists
      if (await container.item(userInfo.id).read() === null) {
        await container.items.create({
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
        });
      }
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
        <Text style={styles.text}>{userInfo.name}</Text>
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
    borderRadius: '25',
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
});

// function App(): JSX.Element {
//   const isDarkMode = useColorScheme() === 'dark';

//   const backgroundStyle = {
//     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
//   };

//   return (
//     <SafeAreaView style={backgroundStyle}>
//       <StatusBar
//         barStyle={isDarkMode ? 'light-content' : 'dark-content'}
//         backgroundColor={backgroundStyle.backgroundColor}
//       />
//       <ScrollView
//         contentInsetAdjustmentBehavior="automatic"
//         style={backgroundStyle}
//       >
//         <Header />
//         <View
//           style={{
//             backgroundColor: isDarkMode ? Colors.black : Colors.white,
//           }}
//         >
//           <Section title="Step One">
//             Edit
//             {' '}
//             <Text style={styles.highlight}>App.tsx</Text>
//             {' '}
//             to change this
//             screen and then come back to see your edits.
//           </Section>
//           <Section title="See Your Changes">
//             <ReloadInstructions />
//           </Section>
//           <Section title="Debug">
//             <DebugInstructions />
//           </Section>
//           <Section title="Learn More">
//             Read the docs to discover what to do next:
//           </Section>
//           <LearnMoreLinks />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// export default App;
