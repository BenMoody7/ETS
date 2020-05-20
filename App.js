import * as React from 'react';
import SplashScreen from 'react-native-splash-screen';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import 'react-native-gesture-handler';
import AppMain from './AppMain';
import SignInScreen from './screens/SignInScreen';
import AsyncStorage from '@react-native-community/async-storage';

const Stack = createStackNavigator();

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      splashScreenTimer: null,
    };
  }
  componentDidMount() {
    let splashScreenTimer = setInterval(this.hideSplashScreen, 3000); // hide splash screen after 3s
    this.setState({splashScreenTimer});
    // you can also add sound here :D
  }
  hideSplashScreen = () => {
    SplashScreen.hide();
    clearInterval(this.state.splashScreenTimer);
  };
  signedIn = async () => {
    try {
      const isSignedIn = await AsyncStorage.getItem('isSignedIn');
      console.log('isSignedIn', isSignedIn);
      return isSignedIn;
    } catch (e) {
      // error reading value
    }
  };
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator
          headerMode="none"
          navigatonOptions={{
            backBehavior: 'none',
          }}
          initialRouteName="SignInScreen"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Home" component={AppMain} />
          <Stack.Screen name="SignInScreen" component={SignInScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
