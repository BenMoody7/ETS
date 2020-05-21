import * as React from 'react';
import {StyleSheet, Text, View, ScrollView} from 'react-native';
import {Appbar, List} from 'react-native-paper';
import {Provider as PaperProvider} from 'react-native-paper';
import {
  IconButton,
  Button,
  Dialog,
  Portal,
  TextInput,
} from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';
import {Picker} from '@react-native-community/picker';
import {TouchableOpacity} from 'react-native-gesture-handler';
import NetInfo from '@react-native-community/netinfo';

export default class Home extends React.Component {
  state = {
    used_weekend_morning: false, //these three properties are used to make sure that the user can have only one class in this specific time. Ther are used in the isUsed('classtime)
    used_weekday_morning: false,
    used_weekday_evening: false,
    isConnected: true, //test the internet connection
    text_valid: false, //class name validation
    time_valid: false, //class time validation
    text: '', //the property used to set the name of the class in the addclass dialogbox
    time: 'Choose a time', //the property used to set the string representing the time of the class in the addclass dialogbox
    visible: false, //used to dismiss the addclass dialogbox
    id: {}, //stores the id of the user in an inner property called id - it is because the server returns {"id": "0000000000000000"}
    classes: [], //stores the class objects in an array
  };
  constructor(props) {
    super(props);
  }
  // the first thing that happens before the screen is rendered in order to connect to the server and get the data in JSON
  getClasses = async () => {
    //checking for internet connection
    if (this.state.isConnected) {
      try {
        //getting the id of the user already stored in the shared storage
        const jsonValue = await AsyncStorage.getItem('id');
        //setting the value of user ID
        this.setState({
          id: JSON.parse(jsonValue),
        });
        //getting the list of classes for that user
        fetch(
          `https://etsbackend.herokuapp.com/users/classes/?id=${
            this.state.id.id
          }`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
          .then(response => response.json())
          .then(data => {
            //storing the array of classes in state
            this.setState({classes: data}, async () => {
              await AsyncStorage.setItem(
                'classes',
                JSON.stringify(this.state.classes),
              );
            });
          })
          .then(() => {
            //changing the value needed to be used in class time validation to avoid having two classes at the same time.
            this.state.classes.map(cls => {
              this.isUsed(cls.time);
            });
          })
          .catch(error => {
            console.error('Error:', error);
          });
      } catch (e) {
        // error reading value
      }
    } else {
      //showing the user that there is no connection
      alert('No internet connection!');
    }
  };
  componentDidMount() {
    //registering a handler that checks for internet access
    this._unsubscribe = NetInfo.addEventListener(state => {
      this.setState(
        {
          isConnected: state.isConnected,
        },
        () => {
          //this screen starts here
          this.getClasses();
        },
      );
    });
  }
  componentWillUnmount() {
    this._unsubscribe();
  }

  //showing the addclass dialogbox
  _showDialog = () => this.setState({visible: true});
  //hiding the addclass dialogbox
  _hideDialog = () => this.setState({visible: false});
  //deleting a class when the trashcan icon is pressed
  deleteClass = index => {
    //cheing for connection
    if (this.state.isConnected) {
      //reversing the values used for class time validation
      const cls = this.state.classes[index];
      switch (cls.time) {
        case 'Weekend morning':
          this.setState({used_weekend_morning: false});
          break;
        case 'Weekday morning':
          this.setState({used_weekday_morning: false});
          break;
        case 'Weekday evening':
          this.setState({used_weekday_evening: false});
          break;
      }
      //removeing the specified class by passing the index of the ListItem pressed
      this.state.classes.splice(index, 1);
      //sending the new value stored in this property to the updateClass method
      this.updateClasses(this.state.classes);
    }
  };
  //responsible for drawing the specified number of classes store in the state property classed[]
  renderList() {
    return this.state.classes.map((cls, key) => {
      return (
        <List.Item
          style={styles.card}
          key={key}
          title={cls.name}
          description={cls.time}
          right={props => (
            <TouchableOpacity
              onPress={() => {
                if (this.state.isConnected) {
                  //calling the deleteClass method and passing the index that should be removed from the array
                  this.deleteClass(key);
                }
              }}>
              <List.Icon {...props} icon={'trash-can-outline'} />
            </TouchableOpacity>
          )}
          left={props => <List.Icon {...props} icon={'account-multiple'} />}
        />
      );
    });
  }
  //responsible for drawing the dropdown list in the addClass dialogbox
  dropDown() {
    return (
      <Picker
        style={styles.drop}
        selectedValue={this.state.time}
        onValueChange={time => {
          this.validate(time, 'time');
        }}>
        <Picker.Item
          label="Choose a time"
          value="Choose a time"
          color="#e31825"
        />
        <Picker.Item
          style={styles.text}
          label="Weekend morning"
          value="Weekend morning"
        />
        <Picker.Item
          style={styles.text}
          label="Weekday morning"
          value="Weekday morning"
        />
        <Picker.Item
          style={styles.text}
          label="Weekday evening"
          value="Weekday evening"
        />
      </Picker>
    );
  }
  //sends the value of classes property stored in state
  updateClasses = async data => {
    if (this.state.isConnected) {
      fetch(
        `https://etsbackend.herokuapp.com/users/update/?id=${this.state.id.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({classes: data}),
        },
      )
        .then(response => response.json())
        .then(async data => {
          await AsyncStorage.setItem(
            'classes',
            JSON.stringify(this.state.classes),
          );
          this.setState({classes: data});
        })
        .then(() => {
          this.state.classes.map(cls => {
            this.isUsed(cls.time);
          });
        })
        .catch(error => {
          console.error('Error:', error);
        });
    } else {
      alert('No internet connection!');
    }
  };
  //adds a class to classes[] and then calls updateClasses()
  add = async (name, time) => {
    if (this.state.isConnected) {
      this._hideDialog();
      let newClass = {name: name, time: time};
      const currentState = this.state.classes.slice();
      currentState.push(newClass);
      this.setState(
        {
          classes: currentState,
          text: '',
          time: 'Choose a time',
          time_valid: false,
          text_valid: false,
        },
        () => {
          this.updateClasses(this.state.classes);
        },
      );
    }
  };
  //validates user input using regex
  validate(value, type) {
    let mask = /^[a-zA-Z0-9 '_]+$/;
    if (type === 'text') {
      if (mask.test(value)) {
        this.setState({
          text: value,
          text_valid: true,
        });
      } else {
        this.setState({
          text_valid: false,
        });
      }
    } else if (type === 'time') {
      if (value != 'Choose a time') {
        this.setState({
          time: value,
          time_valid: true,
        });
      } else {
        this.setState({
          time_valid: false,
        });
      }
    }
  }
  //validates the class time
  isUsed = time => {
    switch (time) {
      case 'Weekend morning':
        if (this.state.used_weekend_morning === false) {
          this.setState({used_weekend_morning: true});
          return true;
        } else {
          return false;
        }
      case 'Weekday morning':
        if (this.state.used_weekday_morning === false) {
          this.setState({used_weekday_morning: true});
          return true;
        } else {
          return false;
        }
      case 'Weekday evening':
        if (this.state.used_weekday_evening === false) {
          this.setState({used_weekday_evening: true});
          return true;
        } else {
          return false;
        }
    }
  };

  render() {
    return (
      <PaperProvider>
        <Appbar.Header style={{backgroundColor: '#e31825'}}>
          <Appbar.Content title="Classes" titleStyle={{textAlign: 'center'}} />
        </Appbar.Header>
        <View style={styles.mainConatinerStyle}>
          <ScrollView style={{margin: 10}}>{this.renderList()}</ScrollView>

          <IconButton
            style={styles.floatingMenuButtonStyle}
            icon="plus"
            color="#f8f8f8"
            size={40}
            onPress={this._showDialog}
          />
          <Portal>
            <Dialog visible={this.state.visible} onDismiss={this._hideDialog}>
              <Dialog.Title style={{color: '#e31825'}}>Add Class</Dialog.Title>
              <Dialog.Content>
                <View>
                  <TextInput
                    style={{margin: 10}}
                    mode="outlined"
                    label="Class Name"
                    onChangeText={text => {
                      this.validate(text, 'text');
                    }}
                    theme={{
                      colors: {
                        primary: '#e31825',
                      },
                    }}
                  />
                  {this.dropDown()}
                </View>
              </Dialog.Content>
              <Dialog.Actions>
                <Button
                  style={{marginRight: 15, marginBottom: 10}}
                  onPress={() => {
                    if (this.state.isConnected) {
                      if (this.state.time_valid && this.state.text_valid) {
                        if (this.isUsed(this.state.time)) {
                          this.add(this.state.text, this.state.time);
                        } else {
                          alert('You already have a class at this time!');
                        }
                      } else {
                        alert('Enter valid values');
                        this._hideDialog();
                      }
                    } else {
                      this._hideDialog();
                      alert('No internet connection!');
                    }
                  }}
                  color="#e31825">
                  <Text style={{color: '#000000', marginRight: 10}}>Add</Text>
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </View>
      </PaperProvider>
    );
  }
}
const styles = StyleSheet.create({
  mainConatinerStyle: {
    flex: 1,
  },
  floatingMenuButtonStyle: {
    backgroundColor: '#e31825',
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: 25,
    right: 15,
    shadowColor: 'rgba(46, 229, 157, 0.4)',
    shadowOpacity: 1.5,
    elevation: 8,
    shadowRadius: 50,
    shadowOffset: {width: 1, height: 13},
  },
  card: {
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  drop: {
    width: '70%',
    borderColor: '#e31825',
    borderWidth: 1,
    top: 20,
  },
});
