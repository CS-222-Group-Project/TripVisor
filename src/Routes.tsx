import MapView, {
  LatLng, Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE, PROVIDER_APPLE,
} from 'react-native-maps';

import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Text,
  TouchableOpacity,
  useColorScheme,
  Linking,
  RefreshControl,
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
  label?: string;
  placeholder?: string;
  onPlaceSelected: (details: GooglePlaceDetail | null) => void;
  subType?: boolean;
};

function InputAutocomplete({
  label,
  placeholder,
  onPlaceSelected,
  subType,
}: InputAutocompleteProps) {
  return (
    <>
      <Text>{label}</Text>
      <GooglePlacesAutocomplete
        styles={{ textInput: subType ? styles.subinput : styles.input }}
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
  const [waypoints, setWaypoints] = useState<LatLng[]>([]);
  const [waypointNames, setWaypointNames] = useState<Array<string | undefined>>([]);
  const [showDirections, setShowDirections] = useState(false);
  const [showWayPts, setShowWayPts] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';
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
  //   const waypointNames: Array<number | undefined> = [];
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

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
    top: height / 5 + edgePaddingValue, // move top below search bar
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

  const clearWaypoints = () => {
    setWaypoints([]);
    setWaypointNames([]);
    onRefresh();
  };

  const showWaypoints = () => {
    setShowWayPts(!showWayPts);
  };

  const openRouteInMaps = () => {
    if (!origin || !destination) {
      return;
    }
    const baseUrl = 'https://www.google.com/maps/dir/?api=1';
    const originParam = `&origin=${origin.latitude},${origin.longitude}`;
    const destinationParam = `&destination=${destination.latitude},${destination.longitude}`;
    const waypointsParam = `&waypoints=${waypoints.map((wp) => `${wp.latitude},${wp.longitude}`).join('|')}`;
    const url = baseUrl + originParam + destinationParam + waypointsParam;
    Linking.openURL(url);
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

  const onWaypointSelected = (
    details: GooglePlaceDetail | null,
    // flag: number,
  ) => {
    // const set = flag === 'origin' ? setOrigin : setDestination;
    console.log(details?.name);
    const position = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0,
    };
    moveTo(position, 10);
    waypoints.push(position);
    // setWaypoints(waypoints);
    waypointNames.push(details?.name);
    setWaypointNames(waypointNames);
    console.log(waypointNames);
    onRefresh();
    // setWaypoints([{ latitude: 41.8781, longitude: -87.6298 }, { latitude: 39.7392, longitude: -104.9903 }]);
    // set(position);
    // moveTo(position, 10);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initPos}
        // onPress={(e) => this.setState({ marker: e.nativeEvent.coordinate })}
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
        <Text>Starting Location</Text>
        <View style={styles.flex}>
          <InputAutocomplete
            onPlaceSelected={(details) => {
              onPlaceSelected(details, 'origin');
            }}
            subType
          />
          <TouchableOpacity
            style={[styles.sideButton,
              {
                backgroundColor: showWayPts ? 'red' : 'blue',
              },
            ]}
            onPress={showWaypoints}
          >
            <Text style={styles.subButtonText}>{showWayPts ? '-' : '📍'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[
          {
            maxHeight: showWayPts ? 'auto' : 0,
            opacity: showWayPts ? 1 : 0,
          },
        ]}
        >
          <Text style={[
            {
              opacity: waypointNames.length ? 1 : 0,
            },
          ]}
          >
            Selected Waypoints

          </Text>
          <ScrollView refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {waypointNames.map((waypointName) => (
              <Text>
                {'      '}
                •
                {waypointName}

              </Text>
            ))}
          </ScrollView>
          <InputAutocomplete
            label="Add Waypoint"
            onPlaceSelected={(details) => {
              onWaypointSelected(details);
            }}
          />
          <TouchableOpacity style={styles.button} onPress={clearWaypoints}>
            <Text style={styles.buttonText}>Clear Waypoints</Text>
          </TouchableOpacity>
        </View>
        <InputAutocomplete
          label="End Location"
          onPlaceSelected={(details) => {
            onPlaceSelected(details, 'destination');
          }}
        />
        <TouchableOpacity style={styles.button} onPress={traceRoute}>
          <Text style={styles.buttonText}>Make Route</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={openRouteInMaps}>
          <Text style={styles.buttonText}>Open in Maps</Text>
        </TouchableOpacity>
      </View>
      <View style={[
        styles.menuButton,
        {
          backgroundColor: isDarkMode ? '#55596D' : '#FFF',
        },
      ]}
      >
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
  flex: {
    flex: 1,
    flexDirection: 'row',
  },
  searchBars: {
    position: 'absolute',
    width: '70%',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 10,
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
    borderRadius: 18,
  },
  subinput: {
    maxWidth: '97%',
    borderColor: 'red',
    borderWidth: 3.5,
    borderRadius: 18,
  },
  button: {
    backgroundColor: 'green',
    paddingVertical: 5,
    marginTop: 1,
    borderRadius: 18,
  },
  sideButton: {
    maxWidth: '20%',
    minWidth: '20%',
    margin: 1,
    // backgroundColor: 'blue',
    borderRadius: 18,
  },
  buttonText: {
    textAlign: 'center',
  },
  subButtonText: {
    color: 'white',
    fontSize: 25,
    top: 6,
    textAlign: 'center',
  },
  menuButtonText: {
    top: 10,
    fontSize: 25,
    textAlign: 'center',
  },
});

export default Routes;
