import * as React from 'react';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import About from './screens/About';
import Home from './screens/Home';
import Salary from './screens/Salary';
import TimeTable from './screens/TimeTable';
import {BackHandler} from 'react-native';

const Tab = createMaterialBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator
      backBehavior="none"
      initialRouteName="Home1"
      activeColor="#f8f8f8"
      labelStyle={{fontSize: 16}}
      barStyle={{backgroundColor: '#e31825'}}>
      <Tab.Screen
        name="Home1"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="TimeSheet"
        component={TimeTable}
        options={{
          tabBarLabel: 'Time Sheet',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons
              name="calendar-month"
              color={color}
              size={26}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Salary"
        component={Salary}
        options={{
          tabBarLabel: 'Salary',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons
              name="currency-usd"
              color={color}
              size={26}
            />
          ),
        }}
      />
      <Tab.Screen
        name="About"
        component={About}
        options={{
          tabBarLabel: 'About',
          tabBarIcon: ({color}) => (
            <MaterialCommunityIcons
              name="information"
              color={color}
              size={26}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default class AppMain extends React.Component {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      BackHandler.exitApp();
    });
  }
  render() {
    return <MyTabs />;
  }
}
