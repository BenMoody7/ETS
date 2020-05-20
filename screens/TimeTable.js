import * as React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {Appbar} from 'react-native-paper';
import {Provider as PaperProvider} from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';
import {useIsFocused, navigation} from '@react-navigation/native';

const date = new Date();
const thisMonth = date.getMonth();
const thisYear = date.getFullYear();
let totalNumberOfDays;

export default class TimeTable extends React.Component {
  state = {
    totalNumberOfHours: 0,
    classes: [],
    marked: null,
  };

  constructor(props) {
    super(props);
  }
  componentWillUnmount() {
    this._unsubscribe();
  }
  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.forceUpdate(() => {
        this.getClasses();
      });
    });
  }
  // initiate = () => {
  //   totalNumberOfDays = this.getDaysInMonth(thisMonth + 1, date.getFullYear());
  //   let tempArray = [];
  //   for (var i = 0; i < totalNumberOfDays; i++) {
  //     let tempString = `${thisYear}-${thisMonth}-${i + 1}`;
  //     tempArray.push(tempString);
  //   }
  //   this.setState({days: tempArray});
  // };
  getClasses = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('classes');
      this.setState({classes: JSON.parse(jsonValue)}, () => {
        this.extractData();
      });
    } catch (e) {
      // error reading value
    }
  };
  getDaysInMonth = (month, year) => {
    // Here January is 1 based
    //Day 0 is the last day in the previous month
    return new Date(year, month, 0).getDate();
    // Here January is 0 based
    // return new Date(year, month+1, 0).getDate();
  };
  formatDate = date => {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };
  extractData = () => {
    totalNumberOfDays = this.getDaysInMonth(thisMonth + 1, date.getFullYear());
    let tArray = this.state.classes.slice();
    let tempObject1 = [];
    let hours = 0;
    tArray.map(cls => {
      for (var i = 0; i < totalNumberOfDays; i++) {
        const dt = new Date(thisYear, thisMonth, i + 1);
        let formated = this.formatDate(dt);
        const day = dt.getDay();
        switch (cls.time) {
          case 'Weekend morning':
            if (day === 0 || day === 6) {
              hours += 4;
              tempObject1.push(formated);
            }
            break;
          case 'Weekday morning':
            if (day >= 1 && day <= 4) {
              hours += 4;
              tempObject1.push(formated);
            }
            break;
          case 'Weekday evening':
            if (day >= 1 && day <= 4) {
              hours += 3;
              tempObject1.push(formated);
            }
            break;
        }
      }
    });
    this.setState({totalNumberOfHours: hours}, async () => {
      await AsyncStorage.setItem('hrs', JSON.stringify(hours));
    });

    var obj = tempObject1.reduce(
      (c, v) =>
        Object.assign(c, {
          [v]: {
            selected: true,
            //marked: true,
            //dotColor: '#e31825',
            selectedColor: 'pink',
          },
        }),
      {},
    );

    this.setState({marked: obj});
  };

  render() {
    return (
      <View>
        <Appbar.Header style={{backgroundColor: '#e31825'}}>
          <Appbar.Content
            title="Time Sheet"
            titleStyle={{textAlign: 'center'}}
          />
        </Appbar.Header>
        <Calendar
          style={styles.mainConatinerStyle}
          hideExtraDays={true}
          disableMonthChange={true}
          disableArrowLeft={true}
          disableArrowRight={true}
          hideArrows={true}
          firstDay={1}
          markedDates={this.state.marked}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#e31825',
            selectedDayTextColor: '#000000',
            todayTextColor: '#00adf5',
            dayTextColor: 'black',
            textDisabledColor: '#d9e1e8',
            dotColor: '#00adf5',
            selectedDotColor: '#ffffff',
            arrowColor: 'orange',
            disabledArrowColor: '#d9e1e8',
            monthTextColor: '#e31825',
            indicatorColor: 'blue',
            textDayFontFamily: 'monospace',
            textMonthFontFamily: 'bold',
            textDayHeaderFontFamily: 'monospace',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 16,
          }}
        />
        <View style={styles.footer}>
          <Text
            style={{
              fontFamily: 'Caveat-Bold',
              paddingLeft: 15,
              paddingRight: 15,
              paddingBottom: 5,
              paddingTop: 5,
              alignContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              fontSize: 40,
            }}>
            Total number of hours
          </Text>
          <Text
            style={{
              width: 150,
              fontFamily: 'Caveat-Bold',
              textAlign: 'center',
              fontSize: 40,
            }}>
            =
          </Text>
          <Text
            style={{
              width: 150,
              fontFamily: 'Caveat-Bold',
              margin: 10,
              padding: 10,
              textAlign: 'center',
              fontSize: 40,
            }}>
            {this.state.totalNumberOfHours}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  footer: {
    top: 80,
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  txt: {},
});
