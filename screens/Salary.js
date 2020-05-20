import * as React from 'react';
import {Text, View, TextInput, StyleSheet} from 'react-native';
import {Appbar} from 'react-native-paper';
import {Provider as PaperProvider} from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';

export default class Salary extends React.Component {
  state = {
    rate: 0,
    hrs: '',
  };
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.forceUpdate(() => {
        this.getHours();
      });
    });
  }
  componentWillUnmount() {
    this._unsubscribe();
  }
  getHours = async () => {
    try {
      const hours = await AsyncStorage.getItem('hrs');
      this.setState({hrs: hours});
    } catch (e) {}
  };
  render() {
    return (
      <PaperProvider>
        <Appbar.Header style={{backgroundColor: '#e31825'}}>
          <Appbar.Content title="Salary" titleStyle={{textAlign: 'center'}} />
        </Appbar.Header>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text
            style={{
              width: 150,
              fontFamily: 'Caveat-Bold',
              margin: 10,
              padding: 10,
              textAlign: 'center',
              fontSize: 50,
            }}>
            {this.state.hrs}
          </Text>
          <View
            style={{
              padding: 10,
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                marginRight: 20,
                fontWeight: 'bold',
                padding: 10,
                textAlign: 'center',
                fontSize: 50,
                right: 15,
                bottom: 30,
              }}>
              X
            </Text>
            <TextInput
              keyboardType={'numeric'}
              placeholder="Hourly rate"
              style={styles.textfield}
              onChangeText={txt => {
                this.setState({rate: txt});
              }}
            />
          </View>
          <View
            style={{
              bottom: 55,
              width: 250,
              borderBottomColor: '#000000',
              borderBottomWidth: 2,
            }}
          />
          <Text
            style={{
              width: 150,
              fontFamily: 'Caveat-Bold',
              textAlign: 'center',
              fontSize: 50,
              bottom: 60,
            }}>
            {Number(this.state.hrs) * Number(this.state.rate) + ' TL'}
          </Text>
        </View>
      </PaperProvider>
    );
  }
}
const styles = StyleSheet.create({
  textfield: {
    fontFamily: 'Caveat-Bold',
    fontSize: 30,
    textAlign: 'center',
    marginLeft: 20,
    width: 150,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#fff',
    right: 35,
    bottom: 16,
  },
});
