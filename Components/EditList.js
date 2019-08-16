import React, {Component} from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import {NavigationEvents} from 'react-navigation'
import PushNotification from 'react-native-push-notification'
import axios from 'axios'
import cherrio from 'react-native-cheerio'

export default class ProductListView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            products: []
        }
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Edit Products',
            headerStyle: {
                backgroundColor: '#35bbca',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        };
    };

    componentDidMount = () => {
        this.getItems();
    }
    
    getItems = () => {
        this.setState({products: []})
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
                        wishPrice: row.wishPrice,
                        ignore: row.ignore == 1 ? true : false,
                        id: row.id
                    }];
                    this.setState({
                        products: [...this.state.products, ...item]
                    });
                }
            })
        })
    }

    ignoreButton = (id, index) => {
        db.transaction(tx => {
            tx.executeSql("UPDATE AmazonProduct SET ignore = ? WHERE ID = ?",
            [this.state.products[index].ignore == true ? 0 : 1, id], (tx, res) => {
                this.getItems();
            })
        })
    }

    deleteButton = (id) => {
        db.transaction(tx => {
            tx.executeSql("DELETE FROM AmazonProduct WHERE ID = ?",
            [id], (tx, res) => {
                this.getItems();
            })
        })
    }

    render() {
        const productLists = this.state.products.length > 0 ? this.state.products.map((item, index) => {
            const ignore = item.ignore == true ? <Text style={{fontSize: 25, color: 'green'}}>✓</Text>
             : <Text style={{fontSize: 25, color: 'orange'}}>✘</Text>;
            const title = item.title.length > 77 ? item.title.slice(0,75) + '...' : item.title;
            return (<View style={styles.productRow}>
                        <Image
                            style={{aspectRatio: 1.5, resizeMode: 'contain', flex: 2}}
                            source={{uri: item.img}}
                        />
                        <Text onPress={() => this.props.navigation.navigate('Webview', {uri: item.url})} style={{flex: 8}}>{title}</Text>
                        <TouchableOpacity onPress={() => this.ignoreButton(item.id, index)} style={{flex: 2, justifyContent: 'center', alignItems: 'center',}}>
                            {ignore}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.deleteButton(item.id)} style={{flex: 2, justifyContent: 'center', alignItems: 'center',}}>
                            <Text style={{fontSize: 25, color:'red', fontWeight: 'bold'}}>✘</Text>
                        </TouchableOpacity>
            </View>);
        }) : <View></View>;
        return (
            <View style={{ flex: 1, padding: 5}}>
                <View style={{flexDirection: 'row'}}>
                <Text style={{flex: 2, textAlign: 'center', fontWeight: 'bold', fontSize: 17}}>Image</Text>
                    <Text style={{flex: 8, textAlign: 'center', fontWeight: 'bold', fontSize: 17}}>Product Title</Text>
                    <Text style={{flex: 2, textAlign: 'center', fontWeight: 'bold', fontSize: 17}}>Ignore</Text>
                    <Text style={{flex: 2, textAlign: 'center', fontWeight: 'bold', fontSize: 17}}>Delete</Text>
                </View>
                <View style={{flex:15}}>{productLists}</View>
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