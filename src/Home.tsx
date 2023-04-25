import React, { useEffect, useRef } from 'react';
import type { PropsWithChildren } from 'react';
import {
  Animated,
  Pressable,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import { NavigationContainer } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TV_LOGO_BACK from './assets/logoBack.png';
import TV_LOGO_VISOR from './assets/logoVisor.png';
import { RootStackParamList } from './RootStackParams';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({ children, title }: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

type Props = {
  navigation: ProfileScreenNavigationProp;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100%',
  },
  image: {
    flex: 1,
    justifyContent: 'center',
    maxHeight: '100%',
  },
  appName: {
    position: 'absolute',
    // height: '0%',
    width: '100%',
    textAlign: 'center',
    top: '55%',
    zIndex: 4,
    elevation: 4,
    color: 'white',
    // margin: 22,
    fontSize: 54,
    fontWeight: '600',
    backgroundColor: '#000000c0',
  },
  button: {
    maxWidth: '70%',
    marginLeft: '15%',
    top: '70%',
    bottom: '10%',
    fontSize: 24,
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
    outline: 'none',
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
  fadingContainer: {
    minHeight: '50%',
    // padding: 20,
    // backgroundColor: 'powderblue',
  },
  areaContainer: {
    height: '40%',
    backgroundColor: '#A2B096',
  },
  botContainer: {
    position: 'absolute',
    // backgroundColor: '#fff',
    backgroundColor: '#A2B096',
    top: '1143%',
    height: 10,
    width: '100%',
    borderWidth: 5,
    borderColor: '#FFFF00',
    borderStyle: 'dashed',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

function Home({ navigation }: Props) {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#55596D' : '#D6DAEA',
    minHeight: '100%',
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnimTwo = useRef(new Animated.Value(0)).current;

  const fadeIn = () => {
    // Will change fadeAnim value to 1 in 3 seconds
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true,
    }).start();
  };

  const fadeInTwo = () => {
    // Will change fadeAnim value to 1 in 3 seconds
    Animated.timing(fadeAnimTwo, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    fadeIn();
    setTimeout(() => { fadeInTwo(); }, 2000);
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}
      >
        <View style={{
          backgroundColor: isDarkMode ? '#5e596D' : '#D6DAEA',
          minHeight: '100%',
        }}
        >
          <ImageBackground source={TV_LOGO_BACK} resizeMode="cover" style={styles.image}>
            <Animated.View
              style={[
                styles.fadingContainer,
                {
                  // Bind opacity to animated value
                  opacity: fadeAnim,
                },
              ]}
            >
              <ImageBackground source={TV_LOGO_VISOR} resizeMode="cover" style={styles.image} />
            </Animated.View>
          </ImageBackground>
          <Animated.View
            style={[
              styles.appName,
              {
                // Bind opacity to animated value
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.appName}>TravelVisor</Text>
          </Animated.View>
          <View style={styles.areaContainer}>
            <Animated.View
              style={[
                styles.areaContainer,
                {
                // Bind opacity to animated value
                  opacity: fadeAnimTwo,
                },
              ]}
            >

              <Pressable
                style={[
                  styles.button,
                  {
                    backgroundColor: isDarkMode ? '#55596D' : '#D6DAEA',
                    // color: isDarkMode ? Colors.black : Colors.white,
                  },
                ]}
                onPress={() => navigation.navigate('Profile', { name: 'Jane' })}
              >
                <Text style={styles.buttonText}>Sign In</Text>
              </Pressable>

            </Animated.View>
          </View>
        </View>
        <View style={styles.botContainer} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default Home;
