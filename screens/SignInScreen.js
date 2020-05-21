import * as React from 'react';
import {Text, View, StyleSheet, TouchableOpacity, Image} from 'react-native';
import 'react-native-gesture-handler';
import {TextInput} from 'react-native-paper';
import {Provider as PaperProvider} from 'react-native-paper';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';

export default class SignInScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: false, //internet connection test
      spinner: false, //loading spinner when signing in or signing up
      user_name: '',
      password: '',
      user_valid: false,
      pass_valid: false,
    };
    onChange = e => {
      this.setState({
        spinner: e,
      });
    };
  }
  componentDidMount() {
    //registers a handler that checks for internet connection
    this._unsubscribe = NetInfo.addEventListener(state => {
      this.setState({isConnected: state.isConnected});
    });
  }
  componentWillUnmount() {
    this._unsubscribe();
  }
  //using regex to validate user input
  validate(text, type) {
    let mask = /^[a-zA-Z0-9]+$/;
    if (type === 'username') {
      if (mask.test(text)) {
        this.setState({
          user_name: text,
          user_valid: true,
        });
      } else {
        this.setState({
          user_valid: false,
        });
      }
    } else if (type === 'password') {
      if (mask.test(text)) {
        this.setState({
          password: text,
          pass_valid: true,
        });
      } else {
        this.setState({
          pass_valid: false,
        });
      }
    }
  }
  //the store the user ID in the shared storage
  storeID = async value => {
    try {
      if (value) {
        const data = JSON.stringify(value);
        const id = 'id';
        if (data.indexOf(id.toLowerCase()) > -1) {
          const jsonValue = JSON.stringify(value);
          await AsyncStorage.setItem('id', jsonValue);
          this.props.navigation.navigate('Home');
        } else {
          alert(`Error: ${data}`);
        }
      }
    } catch (e) {
      // saving error
    }
  };
  render() {
    return (
      <PaperProvider>
        <View style={styles.container}>
          <Spinner visible={this.state.spinner} />
          <View style={styles.img}>
            <Image source={require('./image/justenglish-Logo.png')} />
          </View>
          <TextInput
            mode="flat"
            label="Username"
            theme={{colors: {primary: '#e31825'}}}
            style={styles.input}
            onChangeText={text => {
              this.validate(text, 'username');
            }}
          />
          <TextInput
            secureTextEntry={true}
            mode="flat"
            label="Password"
            theme={{colors: {primary: '#e31825'}}}
            style={styles.input}
            onChangeText={text => {
              this.validate(text, 'password');
            }}
          />
          <View style={styles.btnContainer}>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => {
                if (this.state.isConnected) {
                  if (this.state.user_valid && this.state.pass_valid) {
                    const data = {
                      name: `${this.state.user_name}`,
                      pass: `${this.state.password}`,
                    };
                    onChange(true);
                    console.log(JSON.stringify(data));
                    fetch('https://etsbackend.herokuapp.com/users', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(data),
                    })
                      .then(response => response.json())
                      .then(data => {
                        onChange(false);
                        console.log('Success:', data);
                        this.storeID(data);
                      })
                      .catch(error => {
                        console.error('Error:', error);
                      });
                  } else {
                    alert(
                      'Enter a valid username/password consisting of letters and/or numbers.',
                    );
                  }
                } else {
                  alert('No internet connection!');
                }
              }}>
              <Text style={styles.txt}>Sign up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => {
                if (this.state.isConnected) {
                  if (this.state.user_valid && this.state.pass_valid) {
                    const data = {
                      name: `${this.state.user_name}`,
                      pass: `${this.state.password}`,
                    };
                    onChange(true);
                    fetch(
                      `https://etsbackend.herokuapp.com/users?name=${
                        data.name
                      }&pass=${data.pass}`,
                      {
                        method: 'GET',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                      },
                    )
                      .then(response => response.json())
                      .then(data => {
                        onChange(false);
                        console.log('Success:', data);
                        this.storeID(data);
                      })
                      .catch(error => {
                        console.error('Error:', error);
                      });
                  } else {
                    alert(
                      'Enter a valid username/password consisting of letters and/or numbers.',
                    );
                  }
                } else {
                  alert('No internet connection!');
                }
              }}>
              <Text style={styles.txt}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </PaperProvider>
    );
  }
}

const styles = StyleSheet.create({
  img: {
    padding: 10,
    backgroundColor: '#f8f8f8',
    bottom: 80,
  },
  txt: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  btnContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    margin: 10,
    flex: 1,
    borderRadius: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f8f8f8',
    width: '90%',
    bottom: 10,
    padding: 3,
    margin: 10,
    justifyContent: 'center',
  },
});
