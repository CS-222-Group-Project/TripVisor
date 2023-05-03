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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from './RootStackParams';
import { gKey, bKey } from './envs';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

type Props = {
  navigation: ProfileScreenNavigationProp;
};

type StringLatLngPair = {
  name?: string;
  coord: LatLng;
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
      <Text style={[{ color: 'white' }]}>{label}</Text>
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
  const [origin, setOrigin] = useState<StringLatLngPair | null>();
  const [destination, setDestination] = useState<StringLatLngPair | null>();
  const [waypoints, setWaypoints] = useState<StringLatLngPair[]>([]);
  const [showDirections, setShowDirections] = useState(false);
  const [showWayPts, setShowWayPts] = useState(false);
  const [showRecs, setShowRecs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [reccData, setReccData] = useState<Object[][]>([]);
  const [reccTypes, setReccTypes] = useState<string[]>(['Restaurants', 'HotelsAndMotels', 'Parking', 'AmusementParks', 'Parks', 'Zoos']);
  const [allReccTypes, setAllReccTypes] = useState<string[]>(['Restaurants', 'HotelsAndMotels', 'Parking', 'AmusementParks', 'Carnivals', 'Casinos', 'Museums', 'MallsAndShoppingCenters', 'Parks', 'Zoos']);
  const [reccPage, setReccPage] = useState(0);
  const isDarkMode = useColorScheme() === 'dark';
  const [refreshing, setRefreshing] = useState(false);
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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const mapRef = useRef<MapView>(null);

  const moveToPos = (lat: string, long: string) => {
    const position = {
      latitude: parseFloat(lat),
      longitude: parseFloat(long),
    };
    moveTo(position, 10);
  };

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

  const getPlacesFromApiAsync = async () => {
    try {
      const interestTypes = reccTypes.join();
      if (destination) {
        const baseLink = 'http://dev.virtualearth.net/REST/v1/Routes/LocalInsights?';
        // wp based on destination coord
        const wpLink = `&wp=${destination.coord.latitude},${destination.coord.longitude}`;
        const maxTimeLink = `&maxTime=${duration > 25 ? 25 : 15}&tu=minute`;
        const typeLink = `&type=${interestTypes}`;
        const keyLink = `&key=${bKey}`;
        const fetchLink = baseLink + wpLink + maxTimeLink + typeLink + keyLink;
        const response = await fetch(
          fetchLink,
        );
        const json = await response.json();
        return json.resourceSets[0].resources[0].categoryTypeResults;
      }
      return null;
    } catch (error) {
      console.error(error);
    }
  };

  const generateTravelRecs = async () => {
    const apiResponse = await getPlacesFromApiAsync();
    for (let reccTypeIdx = 0; reccTypeIdx < reccTypes.length; reccTypeIdx += 1) {
      reccData[reccTypeIdx] = apiResponse[reccTypeIdx].entities;
    }
    // reccData[0] = apiResponse[0].entities;
    // console.log(reccData);
    // setReccData(apiResponse[0].entities);
    setShowRecs(true);
  };

  const traceRoute = () => {
    if (origin && destination) {
      setShowDirections(true);
      mapRef.current?.fitToCoordinates([origin.coord, destination.coord], { edgePadding });
      generateTravelRecs();
    }
  };

  const storeRoute = async () => {
    try {
      const route = {
        origin,
        destination,
        waypoints,
      };
      // // commented out for now otherwise data persists forever
      // const routes = await AsyncStorage.getItem('routes');
      // if (routes) {
      //   const routesArray = JSON.parse(routes);
      //   routesArray.push(route);
      //   await AsyncStorage.setItem('routes', JSON.stringify(routesArray));
      // } else {
      await AsyncStorage.setItem('routes', JSON.stringify([route]));
      // }
    } catch (e) {
      // Add your own error handler here
    }
  };

  const getRoute = async () => {
    try {
      const routes = await AsyncStorage.getItem('routes');
      if (routes) {
        const routesArray = JSON.parse(routes);
        const route = routesArray[routesArray.length - 1];
        setOrigin(route.origin);
        setDestination(route.destination);
        setWaypoints(route.waypoints);
      }
    } catch (e) {
      // Add your own error handler here
    }
  };

  const clearWaypoints = () => {
    setWaypoints([]);
    onRefresh();
  };

  const showWaypoints = () => {
    setShowWayPts(!showWayPts);
  };

  const showReccs = () => {
    if (reccData.length > 0) { setShowRecs(!showRecs); }
  };

  const openRouteInMaps = () => {
    if (!origin || !destination) {
      return;
    }
    const baseUrl = 'https://www.google.com/maps/dir/?api=1';

    const originParam = `&origin=${encodeURIComponent(origin.name || `${origin.coord.latitude},${origin.coord.longitude}`)}`;
    const destinationParam = `&destination=${encodeURIComponent(destination.name || `${destination.coord.latitude},${destination.coord.longitude}`)}`;
    const waypointsParam = `&waypoints=${waypoints.map((wp) => encodeURIComponent(wp.name || `${wp.coord.latitude},${wp.coord.longitude}`)).join('%7C')}`;

    const url = baseUrl + originParam + destinationParam + waypointsParam;
    Linking.openURL(url);
  };

  const splitCamelCase = (str: string) => {
    try {
      const newStr = (str.split(/(?=[A-Z])/)).join(' ');
      return newStr;
    } catch (error) {
      console.log(error);
    }
    return str;
  };

  const managePreferences = (str: string) => {
    if (reccTypes.includes(str)) {
      reccTypes.splice(reccTypes.indexOf(str), 1);
    } else {
      reccTypes.push(str);
    }
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
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
    set({ name: details?.name, coord: position });
    moveTo(position, 10);
  };

  const onWaypointSelected = (
    details:
      GooglePlaceDetail |
      {
        name: string,
        geometry: {
          location: {
            lat: number,
            lng: number,
          }
        }
      } |
      null,
  ) => {
    const position = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0,
    };
    waypoints.push({ name: details?.name, coord: position });
    moveTo(position, 10);
    onRefresh();
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initPos}
        // onPress={(e) => this.setState({ marker: e.nativeEvent.coordinate })}
      >
        {/* this.state.marker &&
        <Marker coordinate={this.state.marker} /> */}
        {origin && <Marker title={origin.name} coordinate={origin.coord} />}
        {destination && <Marker title={destination.name} coordinate={destination.coord} />}
        {waypoints.map((wp) => <Marker title={wp.name} coordinate={wp.coord} />)}
        {showDirections && origin && destination && (
          <MapViewDirections
            origin={origin.coord}
            destination={destination.coord}
            waypoints={waypoints.map((wp) => wp.coord)}
            apikey={gKey}
            strokeColor="#007aff"
            strokeWidth={4}
            precision="high" // crashes with long distances in apple maps
            onReady={traceRouteOnReady}
          />
        )}
      </MapView>
      <View style={styles.searchBars}>
        <Text style={[{ color: 'white' }]}>Starting Location</Text>
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
            <Text style={styles.subButtonText}>{showWayPts ? '▼' : '📍+'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[
          {
            opacity: waypoints.length ? 1 : 0,
            height: waypoints.length ? 'auto' : 0,
            color: 'white',
          },
        ]}
        >
          Selected Waypoints

        </Text>
        <ScrollView refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
          {waypoints.map((waypointPair) => (
            <Text style={[{ color: 'white' }]} key={waypointPair.name}>
              {'      '}
              •
              {waypointPair.name}
            </Text>
          ))}
        </ScrollView>
        <View style={[
          {
            maxHeight: showWayPts ? 'auto' : 0,
            opacity: showWayPts ? 1 : 0,
          },
        ]}
        >
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
        <Text style={[{ color: 'white' }]}>End Location</Text>
        <View style={styles.flex}>
          <InputAutocomplete
            onPlaceSelected={(details) => {
              onPlaceSelected(details, 'destination');
            }}
            subType
          />
          <TouchableOpacity
            style={[styles.sideButton,
              {
                backgroundColor: 'green',
                opacity: destination ? 1 : 0.2,
              },
            ]}
            onPress={traceRoute}
          >
            <Text style={styles.subButtonText}>🚘</Text>
          </TouchableOpacity>
        </View>
        <View style={[
          styles.flex,
          {
            maxHeight: showPreferences ? 'auto' : 0,
          },
        ]}
        >
          <ScrollView refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {allReccTypes.slice(0, 5).map((reccPair) => (
              <TouchableOpacity
                style={[
                  styles.reccTypeButtons,
                  {
                    backgroundColor: reccTypes.includes(reccPair) ? 'green' : 'white',
                  },
                ]}
                onPress={() => managePreferences(reccPair)}
              >
                <Text style={styles.buttonText} key={reccPair}>
                  {splitCamelCase(reccPair)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {allReccTypes.slice(5, 10).map((reccPair) => (
              <TouchableOpacity
                style={[
                  styles.reccTypeButtons,
                  {
                    backgroundColor: reccTypes.includes(reccPair) ? 'green' : 'white',
                  },
                ]}
                onPress={() => managePreferences(reccPair)}
              >
                <Text style={styles.buttonText} key={reccPair}>
                  {splitCamelCase(reccPair)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* <TouchableOpacity style={styles.button} onPress={traceRoute}>
          <Text style={styles.buttonText}>Make Route</Text>
        </TouchableOpacity> */}
        {/* <TouchableOpacity style={styles.button} onPress={storeRoute}>
          <Text style={styles.buttonText}>Save Route</Text>
        </TouchableOpacity> */}
        {/* <TouchableOpacity style={styles.button} onPress={getRoute}>
          <Text style={styles.buttonText}>Load Route</Text>
        </TouchableOpacity> */}
        {/* <TouchableOpacity style={styles.button} onPress={openRouteInMaps}>
          <Text style={styles.buttonText}>Open in Maps</Text>
        </TouchableOpacity> */}
      </View>

      <View style={[
        styles.reccBars,
        {
          height: showRecs ? 'auto' : 56,
          opacity: reccData.length > 0 ? 1 : 0,
        },
      ]}
      >
        <View style={styles.flexTwo}>
          <Text style={styles.reccTButtonText}> Recommendations </Text>
          <TouchableOpacity
            style={[styles.sideRecButton,
              {
                backgroundColor: showRecs ? 'gray' : 'skyblue',
              },
            ]}
            onPress={showReccs}
          >
            <Text style={styles.subRecButtonText}>{showRecs ? '▾' : '▴'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.flexTwo}>
          <TouchableOpacity
            style={[styles.sideRecPageButton,
              {
                opacity: (reccPage <= 0) ? 0.25 : 1,
              },
            ]}
            onPress={() => {
              setReccPage((reccPage > 0) ? reccPage - 1 : 0);
            }}
          >
            <Text style={styles.subRecPageButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.reccTypeButtonText}>{splitCamelCase(reccTypes[reccPage])}</Text>
          <TouchableOpacity
            style={[styles.sideRecPageButton,
              {
                opacity: (reccPage >= reccData.length - 1) ? 0.25 : 1,
              },
            ]}
            onPress={() => {
              setReccPage((reccPage < reccData.length - 1) ? reccPage + 1 : reccData.length - 1);
            }}
          >
            <Text style={styles.subRecPageButtonText}>›</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.bottomSpacer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
          {reccData[reccPage]?.slice(0, 5).map((recc) => (
            <TouchableOpacity
              key={recc.entityName}
              style={styles.reccButton}
              onPress={() => {
                moveTo({ latitude: recc.latitude, longitude: recc.longitude }, 13);
                // add way point to selected recc
                onWaypointSelected(
                  {
                    name: recc.entityName,
                    geometry: {
                      location: {
                        lat: recc.latitude,
                        lng: recc.longitude,
                      },
                    },
                  },
                );
              }}
            >
              <Text style={styles.reccButtonText}>
                {recc.entityName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={[
        styles.menuButton,
        {
          bottom: showSettings ? 80 : 20,
        },
      ]}
      >
        <TouchableOpacity onPress={() => navigation.navigate('Profile', { name: 'Jane' })}>
          <Text style={styles.menuButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <View style={[
        styles.menuButton,
        {
          bottom: showSettings ? 140 : 20,
        },
      ]}
      >
        <TouchableOpacity onPress={() => setShowPreferences(!showPreferences)}>
          <Text style={styles.menuButtonText}>{showPreferences ? '🤷‍♂️' : '💁‍♂️'}</Text>
        </TouchableOpacity>
      </View>

      <View style={[
        styles.menuButton,
        {
          bottom: showSettings ? 200 : 20,
        },
      ]}
      >
        <TouchableOpacity onPress={openRouteInMaps}>
          <Text style={styles.menuButtonText}>🗺</Text>
        </TouchableOpacity>
      </View>

      <View style={[
        styles.menuButton,
        {
          bottom: showSettings ? 260 : 20,
        },
      ]}
      >
        <TouchableOpacity onPress={getRoute}>
          <Text style={styles.menuButtonText}>👀</Text>
        </TouchableOpacity>
      </View>

      <View style={[
        styles.menuButton,
        {
          bottom: showSettings ? 320 : 20,
        },
      ]}
      >
        <TouchableOpacity onPress={storeRoute}>
          <Text style={styles.menuButtonText}>💾</Text>
        </TouchableOpacity>
      </View>

      <View style={[
        styles.menuButton,
      ]}
      >
        <TouchableOpacity onPress={() => setShowSettings(!showSettings)}>
          <Text style={styles.menuButtonText}>{showSettings ? '📂' : '📁'}</Text>
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
  flexTwo: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 50,
  },
  searchBars: {
    position: 'absolute',
    width: '70%',
    backgroundColor: '#55596D',
    padding: 8,
    borderRadius: 10,
    top: Constants.statusBarHeight,
  },
  reccBars: {
    position: 'absolute',
    width: '65%',
    backgroundColor: '#55596D',
    padding: 8,
    borderRadius: 10,
    bottom: -8,
  },
  menuButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: '#55596D',
    // padding: 8,
    borderRadius: 18,
    bottom: 20,
    right: 20,
  },
  reccButton: {
    maxWidth: '97%',
    backgroundColor: 'skyblue',
    borderColor: 'skyblue',
    borderWidth: 3.5,
    borderRadius: 18,
    margin: 7,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  bottomSpacer: {
    marginBottom: 20,
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
    margin: 4,
    borderRadius: 18,
  },
  reccTypeButtons: {
    borderColor: 'green',
    borderWidth: 3.5,
    paddingVertical: 5,
    margin: 4,
    borderRadius: 18,
    maxWidth: 130,
  },
  sideButton: {
    maxWidth: '20%',
    maxHeight: 47,
    minWidth: '20%',
    margin: 1,
    // backgroundColor: 'blue',
    borderRadius: 18,
  },
  sideRecButton: {
    maxWidth: '20%',
    maxHeight: 30,
    minWidth: '20%',
    margin: 1,
    // backgroundColor: 'blue',
    borderRadius: 18,
  },
  sideRecPageButton: {
    maxWidth: '20%',
    maxHeight: 20,
    minWidth: '20%',
    margin: 1,
    top: -5,
    backgroundColor: 'gray',
    borderRadius: 18,
  },
  buttonText: {
    textAlign: 'center',
  },
  reccTButtonText: {
    color: 'white',
    fontSize: 20,
    top: 2,
    left: 0,
    textAlign: 'left',
    marginHorizontal: 10,
    fontWeight: 'bold',
  },
  reccTypeButtonText: {
    color: 'white',
    fontSize: 18,
    top: -8,
    minWidth: '40%',
    maxWidth: '40%',
    textAlign: 'center',
    marginHorizontal: 25,
    textDecorationLine: 'underline',
  },
  reccButtonText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
  },
  subButtonText: {
    color: 'white',
    fontSize: 25,
    top: 6,
    textAlign: 'center',
  },
  subRecButtonText: {
    color: 'white',
    fontSize: 25,
    textAlign: 'center',
  },
  subRecPageButtonText: {
    color: 'white',
    top: -8,
    height: 30,
    fontSize: 25,
    textAlign: 'center',
  },
  menuButtonText: {
    top: 10,
    fontSize: 25,
    textAlign: 'center',
  },
});

export default Routes;
