# TripVisor
## **CS 222 - Course Project - Byte Bandits**

## Video
[YouTube Video](https://youtu.be/dJn0BEAKQeY)

## Team Members
- Ronit Anandani (anandani4136) - Recommendations, Waypoints, UI/UX
- Nikhil Joshi (NikhilJ10) - Maps, Routing
- Pradnyan Khodke (Pradnyan-Khodke) - Google Auth, Database
- Ansh Verma (DarthAV) - Local Storage, Waypoints, Database

## Description
TripVisor is a mobile app that allows users to explore certain journeys through an interactive map and route builder.

Individuals who are taking a road trip may find it difficult to plan out the various stops and timespans throughout the trip. Currently, users must decide which locations they would like to visit, manually add them to Google Maps, decide where/when they should take breaks, and determine attractions along the route. By integrating the entire planning experience into a single page, TripVisor allows users to save time in the planning stage and streamline all aspects of their road trip.

### Features
- Users can add various cities that they would like to visit on the road trip
- Users can view the route they will be taking and the time each step will take
- Users can view suggested breaks and night-stays
- Users can make adjustments to the order of stops 
- Users can create a custom Google Maps link that routes through all their desired stops
- Users can save their trip to an account linked to a Google Account allowing them to save and view trip data across devices

## Technical Architecture
- Tech Stack: 
    - React Native
    - Typescript
- Database: 
    - Azure Cosmos DB - NoSQL
- Development Tools
    - Visual Studio Code
    - Expo
    - ESLint
- APIs: 
    - Google Maps API
    - Google Places API
    - Google Routes API
    - Bing Local Suggestions API

![image](https://user-images.githubusercontent.com/29022142/236038610-c036e7d6-003a-43b7-9c1c-f0f2925e7621.png)



## How to run the project
TripVisor has not yet deployed to the App Store. For development, we use Expo to build and run the project locally. To run the project on your phone, follow these steps:
1. Clone the repository
2. Ensure you have Node.js and Yarn installed
3. Run `yarn install` to install all the dependencies
4. Run `yarn expo start` to start the project
5. Download the Expo Go app on your phone and scan the QR code to run the app
6. You should be able to see the app running on your phone

