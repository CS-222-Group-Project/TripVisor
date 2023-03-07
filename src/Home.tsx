import React from 'react';
import type { PropsWithChildren } from 'react';
import {
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
DebugInstructions,
Header,
LearnMoreLinks,
ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';


import {NavigationContainer} from '@react-navigation/native';



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
            ]}>
            {title}
        </Text>
        <Text
            style={[
            styles.sectionDescription,
            {
                color: isDarkMode ? Colors.light : Colors.dark,
            },
            ]}>
            {children}
        </Text>
        </View>
    );
}

const image = {uri: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cm9hZCUyMHRyaXB8ZW58MHx8MHx8&w=1000&q=80'};

const Home = ({navigation}) => {
    const isDarkMode = useColorScheme() === 'dark';

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
        minHeight: '100%',
    };

    return (
        <SafeAreaView style={backgroundStyle}>
        <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
        />
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={backgroundStyle}>
            <View style={{
                backgroundColor: isDarkMode ? Colors.black : Colors.white,
                minHeight: '60%',
            }}>
            <ImageBackground source={image} resizeMode="cover" style={styles.image}>
                <Text style={styles.appName}>TravelVisor</Text>
            </ImageBackground>
            
            <Pressable style={styles.button} onPress={() =>
                    navigation.navigate('Profile', {name: 'Jane'}) 
            }>
                <Text style={styles.buttonText}>Sign In</Text>
            </Pressable>
            
            {/* <Section title="Step One">
                Edit <Text style={styles.highlight}>App.tsx</Text> to change this
                screen and then come back to see your edits.
            </Section>
            <Section title="See Your Changes">
                <ReloadInstructions />
            </Section>
            <Section title="Debug">
                <DebugInstructions />
            </Section>
            <Section title="Learn More">
                Read the docs to discover what to do next:
            </Section> */}
            {/* <LearnMoreLinks /> */}
            </View>
        </ScrollView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: '100%',
    },
    image: {
        flex: 1,
        justifyContent: 'center',
        minHeight: '40%',
    },
    appName: {
        textAlign:'center',
        color: 'white',
        margin: 22,
        fontSize: 54,
        fontWeight: '600',
        backgroundColor: '#000000c0',
    },
    button: {
        maxWidth: '70%',
        marginLeft: '15%',
        fontSize: 24,
        cursor: 'pointer',
        textAlign: 'center',
        textDecoration: 'none',
        outline: 'none',
        color: '#fff',
        backgroundColor: '#133F50',
        border: 'none',
        borderRadius: 25,
        boxShadow: '0 9px #999',
    },
    buttonText: {
        textAlign:'center',
        color: 'white',
        margin: 22,
        fontSize: 24,
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

export default Home;