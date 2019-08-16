import React, {Component} from 'react';
import { StyleSheet, Text, View, Image, Button } from 'react-native';
import {NavigationEvents} from 'react-navigation'
import PushNotification from 'react-native-push-notification'
import axios from 'axios'
import cherrio from 'react-native-cheerio'
import { TouchableOpacity } from 'react-native-gesture-handler';

export default class ProductListView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            products: []
        }
    }

    componentDidMount() {
        this.props.navigation.setParams({ goToEdit: this.goToEdit });
    }

    goToEdit = () => {
        this.props.navigation.navigate("EditList");
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Product Hunt',
            headerStyle: {
                backgroundColor: '#35bbca',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
            headerRight: (
            <TouchableOpacity style={{paddingRight: 10, paddingLeft:10, marginRight: 10,}}
              onPress={navigation.getParam('goToEdit')}>
                  <Text style={{fontSize: 17, color: 'white'}}>Edit</Text>
              </TouchableOpacity>
          ),
        };
    };

    navigatedBack = () => {
        this.setState({
            products: []
        });
        db.transaction(tx => {
            tx.executeSql("SELECT * FROM AmazonProduct",
            [], (tx, res) => {
                for(let i = 0; i < res.rows.length; i++) {
                    let row = res.rows.item(i);
                    const item = [{
                        title: row.title,
                        url: row.url,
                        img: row.img,
                        price: row.price,
                        wishPrice: row.wishPrice
                    }];
                    this.setState({
                        products: [...this.state.products, ...item]
                    });
                }
            })
        })
    }

    render() {
        const productLists = this.state.products.length > 0 ? this.state.products.map(item => {
            const title = item.title.length > 77 ? item.title.slice(0,75) + '...' : item.title;
            const wishPrice = Number(item.wishPrice) >= Number(item.price) ? <Text style={{flex: 2, textAlign: 'center', color: 'green', fontWeight: 'bold'}}>{item.wishPrice}</Text>
            : <Text style={{flex: 2, textAlign: 'center'}}>{item.wishPrice}</Text>
            return (<View style={styles.productRow}>
                        <Image
                            style={{aspectRatio: 1.5, resizeMode: 'contain', flex: 2}}
                            source={{uri: item.img}}
                        />
                        <Text onPress={() => this.props.navigation.navigate('Webview', {uri: item.url})} style={{flex: 8}}>{title}</Text>
                        <Text style={{flex: 1.5, textAlign: 'center'}}>{item.price}</Text>
                        {wishPrice}
            </View>);
        }) : <View></View>;
        return (
            <View style={{ flex: 1, padding: 5}}>
                <View style={{flexDirection: 'row'}}>
                    <Text style={{flex: 2, textAlign: 'center', fontWeight: 'bold', fontSize: 17}}>Image</Text>
                    <Text style={{flex: 8, textAlign: 'center', fontWeight: 'bold', fontSize: 17}}>Product Title</Text>
                    <Text style={{flex: 1.5, textAlign: 'center', fontWeight: 'bold', fontSize: 17}}>Price</Text>
                    <Text style={{flex: 2, textAlign: 'center', fontWeight: 'bold', fontSize: 17}}>Wish</Text>
                </View>
                <View style={{flex:15}}>{productLists}</View>
                <Button color="#35bbca" onPress={() => {this.props.navigation.navigate('Webview', {uri: 'https://www.amazon.com/'})}} style={{flex:1}} title="Go to Amazon.com"/>
                <NavigationEvents onDidFocus={this.navigatedBack} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    productRow: {
        flexDirection: 'row',
        marginTop: 15,
        paddingTop: 10,
        paddingBottom: 10,
        borderBottomWidth: 1.5,
        borderBottomColor: "#ccc",
        elevation: 0.5,
        justifyContent: 'center',
    },
});