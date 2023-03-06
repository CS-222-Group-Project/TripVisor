# TripVisor
## **CS 222 - Course Project - Byte Bandits**

## Team Members
- Ansh Verma (DarthAV)
- Ronit Anandani (anandani4136)
- Nikhil Joshi 
- Pradnyan Khodke (Pradnyan-Khodke)

## Description
Individuals who are taking a road trip may find it difficult to plan out the various stops and 
timespans throughout the trip. Currently, users must decide which locations they would like to 
visit, manually add them to Google Maps, decide where/when they should take breaks, and 
determine attractions along the route. By integrating the entire planning experience into a single 
page, TravelVisor allows users to save time in the planning stage and streamline all aspects of 
their road trip.

### Features
- Users can sign into their account to view past trip data
- Users can add various cities that they would like to visit on the road trip
- Users can view the route they will be taking and the time each step will take
- Users can view suggested breaks and night-stays
- Users can make adjustments to the order of stops 
- Users can create a custom Google Maps link that routes through all their desired stops
- Users can save their trip to an account linked to a SSO (single sign on authentication)
account such as Google



## How to run the project
1. Clone the repository
2. Ensure you have Node.js and Yarn installed
3. Run `yarn install` to install all the dependencies
4. Run `yarn expo start` to start the project
5. Download the Expo Go app on your phone and scan the QR code to run the app
6. You should be able to see the app running on your phone

### How to run the tests
- Run `yarn test` to run all the tests
- Run `yarn test --watch` to run all the tests in watch mode

### How to run the linter
- Run `yarn lint` to run the linter through the command line
- Run `yarn lint --fix` to run the linter and fix any errors that can be fixed automatically
- To run the linter visuall in VSCode:
    - Install the ESLint extension on VSCode
    - Configure the extension to use the project's ESLint configuration
    - Ensure VSCodes's "Format on Save" option is enabled to automatically format the code on save
