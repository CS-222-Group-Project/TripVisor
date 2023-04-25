import MapView, {
  LatLng, Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE, PROVIDER_APPLE,
} from 'react-native-maps';

import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
} from 'react-native-google-places-autocomplete';

import Constants from 'expo-constants';
import React, { useRef, useState } from 'react';
import MapViewDirections from 'react-native-maps-directions';
import { NavigationContainer } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './RootStackParams';
import { gKey } from './envs';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

type Props = {
  navigation: ProfileScreenNavigationProp;
};

// const gKey = process.env.REACT_APP_G_KEY;

const { width, height } = Dimensions.get('window');

const aspect = width / height;
const latDel = 0.02;
const longDel = latDel * aspect;

const initPos = {
  latitude: 40.1020,
  longitude: -88.2272,

  latitudeDelta: latDel,
  longitudeDelta: longDel,
};

type InputAutocompleteProps = {
  label: string;
  placeholder?: string;
  onPlaceSelected: (details: GooglePlaceDetail | null) => void;
};

function InputAutocomplete({
  label,
  placeholder,
  onPlaceSelected,
}: InputAutocompleteProps) {
  return (
    <>
      <Text>{label}</Text>
      <GooglePlacesAutocomplete
        styles={{ textInput: styles.input }}
        placeholder={placeholder || ''}
        fetchDetails
        onPress={(data, details = null) => {
          onPlaceSelected(details);
        }}
        query={{
          key: gKey,
          language: 'en-US',
        }}
      />
    </>
  );
}

function Routes({ navigation }: Props) {
  const [origin, setOrigin] = useState<LatLng | null>();
  const [destination, setDestination] = useState<LatLng | null>();
  const [showDirections, setShowDirections] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  //   this.state = {
  //     region: {
  //       latitude: Lat,
  //       longitude: LONGITUDE,
  //       latitudeDelta: LATITUDE_DELTA,
  //       longitudeDelta: LONGITUDE_DELTA,
  //     },
  //     marker: null,
  //   };

  const mapRef = useRef<MapView>(null);

  const moveTo = async (position: LatLng, zoom: number) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      camera.center = position;
      camera.zoom = zoom;
      mapRef.current?.animateCamera(camera, { duration: 1000 });
    }
  };

  const edgePaddingValue = 70;

  const edgePadding = {
    top: Constants.statusBarHeight + height / 4 + edgePaddingValue, // move top below search bar
    right: edgePaddingValue,
    bottom: edgePaddingValue,
    left: edgePaddingValue,
  };

  const traceRouteOnReady = (args: any) => {
    if (args) {
      setDistance(args.distance);
      setDuration(args.duration);
    }
  };

  const traceRoute = () => {
    if (origin && destination) {
      setShowDirections(true);
      mapRef.current?.fitToCoordinates([origin, destination], { edgePadding });
    }
  };

  const onPlaceSelected = (
    details: GooglePlaceDetail | null,
    flag: 'origin' | 'destination',
  ) => {
    const set = flag === 'origin' ? setOrigin : setDestination;
    const position = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0,
    };
    set(position);
    moveTo(position, 10);
  };
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initPos}
        onPress={(e) => this.setState({ marker: e.nativeEvent.coordinate })}
      >
        {/* this.state.marker &&
        <Marker coordinate={this.state.marker} /> */}
        {origin && <Marker coordinate={origin} />}
        {destination && <Marker coordinate={destination} />}
        {showDirections && origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={gKey}
            strokeColor="#007aff"
            strokeWidth={4}
            // precision="high" // crashes with long distances
            onReady={traceRouteOnReady}
          />
        )}
      </MapView>
      <View style={styles.searchBars}>
        <InputAutocomplete
          label="Starting Location"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, 'origin');
          }}
        />
        <InputAutocomplete
          label="End Location"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, 'destination');
          }}
        />
        <TouchableOpacity style={styles.button} onPress={traceRoute}>
          <Text style={styles.buttonText}>Make Route</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.menuButton}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { name: 'Jane' })}>
          <Text style={styles.menuButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>
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
  searchBars: {
    position: 'absolute',
    width: '70%',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 4,
    top: Constants.statusBarHeight,
  },
  menuButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: 'white',
    // padding: 8,
    borderRadius: 18,
    bottom: 30,
    right: 30,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  input: {
    borderColor: 'red',
    borderWidth: 3.5,
    borderRadius: 2,
  },
  button: {
    backgroundColor: 'green',
    paddingVertical: 5,
    marginTop: 1,
    borderRadius: 4,
  },
  buttonText: {
    textAlign: 'center',
  },
  menuButtonText: {
    top: 10,
    fontSize: 25,
    textAlign: 'center',
  },
});

export default Routes;
