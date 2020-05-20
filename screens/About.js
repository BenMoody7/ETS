import * as React from 'react';
import {Component, Text, View} from 'react-native';

import {Appbar} from 'react-native-paper';
import {Provider as PaperProvider} from 'react-native-paper';
const About = () => {
  return (
    <PaperProvider>
      <Appbar.Header style={{backgroundColor: '#e31825'}}>
        <Appbar.Content title="Info" titleStyle={{textAlign: 'center'}} />
      </Appbar.Header>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Developed by nurhamdon@gmail.com</Text>
      </View>
    </PaperProvider>
  );
};
export default About;
