import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button,
  ScrollView,
  ListView,
  TextInput,
  Alert,
} from 'react-native';

//import Icon from 'react-native-vector-icons';
import { List, ListItem, Tile } from 'react-native-elements'
import { Icon } from 'react-native-elements'
import { StackNavigator } from 'react-navigation';

const Realm = require('realm');

const CarSchema = {
  name: 'Car',
  primaryKey: 'id',
  properties: {
    id: { type: 'int', indexed: true },
    brand: 'string',
    model: 'string',
    price: 'float',
    doors: 'int',
    color: 'string',
    year: 'int',
    km: 'int',
  }
};

class CarsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      realm: null,
      lastId: 0,
      carsSize: 0,
      carList: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }),
    };

    this.renderRow = this.renderRow.bind(this);
  }

  static navigationOptions = {
    title: 'Cars',
  };

  componentDidMount() {
    this.loadCars();
  }

  loadCars() {
    Realm.open({ schema: [CarSchema] })
      .then(realm => {

        let cars = realm.objects('Car')
        let id = cars.max("id") ? cars.max("id") : 0

        this.setState({
          carList: this.state.carList.cloneWithRows(cars),
          lastId: id,
          realm,
        });

      })
      .catch(error => {
        console.log(error);
        Alert.alert(
          'Load Car error',
          'Error: ' + error,
          { cancelable: false }
        )
      });
  }

  deleteCar({ id: idValue }) {
    Realm.open({ schema: [CarSchema] })
      .then(realm => {
        realm.write(() => {
          let car = realm.objects('Car').filtered('id = $0', idValue);
          realm.delete(car);
        });
      })
      .catch(error => {
        console.log(error);
        Alert.alert(
          'Delete Car error',
          'Error: ' + error,
          { cancelable: false }
        )
      });
    this.loadCars();
  }

  renderRow(rowData, sectionID) {
    return (
      <ListItem
        leftIcon={{ name: 'directions-car' }}
        title={rowData.brand + " " + rowData.model}
        subtitle={rowData.km + " km" + "  /  " + (rowData.price).toFixed(2) + " PLN"}
        rightIcon={{ name: 'chevron-right' }}
        onPress={() => {
          this.props.navigation.navigate('Details', {
            car: rowData,
          });
        }}
      />
    )
  }

  render() {
    let lastId = this.state.lastId

    return (
      <View style={styles.container}>
        <View style={styles.buttons}>
          <Icon
            name='ios-trash'
            type='ionicon'
            color='#517fa4'
            size={32}
            onPress={() => this.deleteCar({ id: lastId })}
          />

          <Icon
            name='ios-add-circle'
            type='ionicon'
            color='#517fa4'
            size={32}
            onPress={() => {
              /* 1. Navigate to the Details route with params */
              this.props.navigation.navigate('AddCarModal', {
                nextId: lastId + 1,
                ScreenCars: this,
              });
            }}
          />
          <Icon
            name='ios-search'
            type='ionicon'
            color='#517fa4'
            size={32}
            onPress={() => {
              /* 1. Navigate to the Details route with params */
              this.props.navigation.navigate('SearchModal', {
                nextId: lastId + 1,
                ScreenCars: this,
              });
            }}
          />
        </View>
        <ScrollView style={{ width: "100%" }}>
          <List>
            <ListView
              dataSource={this.state.carList}
              renderRow={this.renderRow}
              enableEmptySections={true}
            />
          </List>
        </ScrollView>
      </View>
    );
  }
}

class AddCarView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      brand: "NoBrand",
      model: "NoModel",
      price: 12900.00,
      doors: 4,
      color: "red",
      year: 2012,
      km: 48000,
    };
  }

  addCar({ id: nextId }) {
    Realm.open({ schema: [CarSchema] })
      .then(realm => {
        realm.write(() => {
          const myCar = realm.create('Car', {
            id: nextId,
            brand: this.state.brand,
            model: this.state.model,
            price: this.state.price,
            doors: this.state.doors,
            color: this.state.color,
            year: this.state.year,
            km: this.state.km,
          });
        });
        this.props.navigation.state.params.ScreenCars.loadCars();
        this.props.navigation.goBack()
      })
      .catch(error => {
        console.log(error);
        Alert.alert(
          'Add Car error',
          'Error: ' + error,
          { cancelable: false }
        )
      });
  }

  render() {
    const { params } = this.props.navigation.state;
    const nextId = params ? params.nextId : null;
    return (
      <ScrollView>
        <View style={{ flex: 1, alignItems: 'stretch', justifyContent: 'center' }}>
          <View style={styles.form}>
            <Text style={{ paddingVertical: 18 }}>
              Adding car with ID: {nextId}
            </Text>
            <Text>
              Brand:
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => this.setState({ brand: text })}
            />
            <Text style={styles.label}>
              Model:
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => this.setState({ model: text })}
            />
            <Text style={styles.label}>
              Price:
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => this.setState({ price: text })}
            />
            <Text style={styles.label}>
              Doors:
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => this.setState({ doors: text })}
            />
            <Text style={styles.label}>
              Color:
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => this.setState({ color: text })}
            />
            <Text style={styles.label}>
              Year:
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => this.setState({ year: text })}
            />
            <Text style={styles.label}>
              Km:
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => this.setState({ km: text })}
            />
          </View>

          <Button
            onPress={() => this.addCar({ id: nextId })}
            title="Add"
          />
          <Button
            onPress={() => this.props.navigation.goBack()}
            title="Close"
          />
        </View>
      </ScrollView>
    );
  }
}

class SearchView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  prepareSearch() {

    this.props.navigation.goBack()
  }

  render() {
    return (
      <ScrollView>
        <View style={{ flex: 1, alignItems: 'stretch', justifyContent: 'center' }}>
          <View style={styles.form}>
            <Text style={{ paddingVertical: 18 }}>
              Type params for serach:
            </Text>
            <Text>
              Brand:
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => this.setState({ brand: text })}
            />
            <Text style={styles.label}>
              Model:
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => this.setState({ model: text })}
            />
            <Text style={styles.label}>
              Price:
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => this.setState({ price: text })}
            />
            <Text style={styles.label}>
              Doors:
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => this.setState({ doors: text })}
            />
            <Text style={styles.label}>
              Color:
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => this.setState({ color: text })}
            />
            <Text style={styles.label}>
              Year:
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => this.setState({ year: text })}
            />
            <Text style={styles.label}>
              Km:
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => this.setState({ km: text })}
            />
          </View>

          <Button
            onPress={() => this.prepareSearch()}
            title="Serach"
          />
          <Button
            onPress={() => this.props.navigation.goBack()}
            title="Close"
          />
        </View>
      </ScrollView>
    );
  }
}

class DetailsView extends React.Component {

  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;

    return {
      title: params && params.car ? params.car.brand + " " + params.car.model : 'Car:',
    }
  };

  render() {
    const { params } = this.props.navigation.state
    const car = params && params.car ? params.car : null

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>{car.brand + " " + car.model + " " + car.year}r.</Text>
        <Text>Color: {car.color}</Text>
        <Text>Price: {(car.price).toFixed(2)} PLN</Text>
        <Text>Doors: {car.doors}</Text>
        <Text>Mileage: {car.km} km</Text>
      </View>
    );
  }
}


const MainStack = StackNavigator(
  {
    Home: {
      screen: CarsView,
    },
    Details: {
      screen: DetailsView,
    },
  },
  {
    initialRouteName: 'Home',
    navigationOptions: {
      headerStyle: {
        backgroundColor: "white",
      },
      headerTintColor: "black",
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
  }
);

const RootStack = StackNavigator(
  {
    Main: {
      screen: MainStack,
    },
    AddCarModal: {
      screen: AddCarView,
    },
    SearchModal: {
      screen: SearchView,
    },
  },
  {
    initialRouteName: 'Main',
    mode: 'modal',
    headerMode: 'none',
  },
);

export default class App extends React.Component {
  render() {
    return <RootStack />;
  }
}

const styles = StyleSheet.create({
  buttons: {
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    // backgroundColor: '#F5FCFF',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  form: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 12,
  },
  input: {
    height: 30,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  label: {
    paddingTop: 8,
  }
});