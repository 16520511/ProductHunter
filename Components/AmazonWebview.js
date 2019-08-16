import React, {Component} from 'react';
import { StyleSheet, Text, View, TouchableHighlight, Modal, TextInput, ToastAndroid, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios'
import cherrio from 'react-native-cheerio'
import {NavigationEvents} from 'react-navigation'


export default class AmazonWebView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            canGoBack: false,
            url: "https://www.amazon.com",
            modalVisible: false,
            wishPrice: ""
        }
    }

    static navigationOptions = {
        title: 'Amazon',
        headerStyle: {
          backgroundColor: '#35bbca',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
    };
    

    handleWebViewNavigationStateChange = (newWebState) => {
        const {url, canGoBack} = newWebState;
        this.setState({
            canGoBack,
            url
        });
    }

    checkModal = () => {
        console.log(this.state.wishPrice);
        const _this = this;
        this.setState({modalVisible: false});
        //Add the link to database
        axios.get( _this.state.url, {}).then(res => {
            const html = res.data;
            const $ = cherrio.load(html);

            const title = $('#productTitle').text().trim();
            const url = _this.state.url;
            var price = $('#priceblock_dealprice').text().slice(1, -1);
            if (price == "")
                price = $("#priceblock_ourprice").text().slice(1, -1);
            console.log(price);
            if(isNaN(price))
                Alert.alert("Can't get product price", "Please specify all options to get the correct price for the product", 
                [{text: "Okay"}]);
                // ToastAndroid.showWithGravity(
                //     'Please specify all options to get the correct price for the product',
                //     ToastAndroid.SHORT,
                //     ToastAndroid.CENTER,
                // );
            else {
                // const img = $('#imgTagWrapperId #landingImage')["0"].attribs["data-old-hires"];
                const img = Object.keys(JSON.parse($('#imgTagWrapperId #landingImage')["0"].attribs["data-a-dynamic-image"]))[0];
                const wishPrice = this.state.wishPrice.toString();
                // if(Number(wishPrice) < Number(price)) { 
                    db.transaction(tx => {
                        tx.executeSql("DELETE FROM AmazonProduct WHERE title = (?)", [title]);
                        tx.executeSql("INSERT INTO AmazonProduct (title, url, img, price, wishPrice, ignore) VALUES (?,?,?,?,?,?)",
                        [title, url, img, price, wishPrice, 0], (tx, res) => {
                            console.log("insertId: " + res.insertId + " -- probably 1");
                            console.log("rowsAffected: " + res.rowsAffected + " -- should be 1");
                        })
                    });
                    ToastAndroid.showWithGravity(
                        'This product has been added to your wishlist',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                // }
                // else
                    // Alert.alert("Invalid wish price", "Your wish price has to be smaller than the current price", 
                    // [{text: "Okay"}]);
            }
        })
    }

    handleBackClick = () => {
        let _this = this
        setTimeout(function(){
            if (_this.state.canGoBack)
                _this._wv.goBack();
        }, 2000);
    }

    setModalVisible = (visible) => {
        this.setState({modalVisible: visible});
    }

    navigatedBack = () => {
        this.setState({
            modalVisible: false
        });
    }

    handleAddClick = () => {
        const _this = this;
        setTimeout(function(){
            if (_this.state.url.includes("/dp/"))
            {
                _this.setState({
                    modalVisible: true
                });
            }
            else {
                // ToastAndroid.show('A pikachu appeared nearby !', ToastAndroid.SHORT);
                ToastAndroid.showWithGravity(
                    'This is not a valid product link',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            }
        }, 1800);
    }

    render() {
        return (
            <View style={{ flex: 1}}>
                <Modal
                style={styles.modalContent}
                transparent={true}
                visible={this.state.modalVisible}>
                      <View style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'}}>
                        <View style={styles.modalInnerWrapper}>
                            <Text style={{color:"white"}}>At what maximum price do you wish to be notified?</Text>
                            <TextInput width="60%" placeholder="Enter wish price" style={{height: 40, borderBottomColor: 'white', color:"white", borderBottomWidth: 1.5}}
                                onChangeText={(wishPrice) => this.setState({wishPrice})} keyboardType='numeric' />
                            <View style={{flexDirection: "row"}}>
                                <View styles={styles.checkWrapper}>
                                <TouchableHighlight onPress={this.checkModal} style={styles.checkModalButton}
                                            underlayColor='teal'>
                                    <Text style={{fontSize: 20, color: 'white'}}>✔</Text>
                                </TouchableHighlight>
                                </View>
                                <TouchableHighlight onPress={() => this.setModalVisible(!this.state.modalVisible)} style={styles.closeModalButton}
                                            underlayColor='teal'>
                                    <Text style={{fontSize: 20, color: 'white'}}>✘</Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </View>
                </Modal>
                <WebView ref={component => this._wv = component} source={{ uri: this.props.navigation.getParam('uri', 'https://amazon.com') }}
                onNavigationStateChange={this.handleWebViewNavigationStateChange} />
                <TouchableHighlight onPress={this.handleAddClick} style={styles.addButton}
                                underlayColor='#ff7043'>
                    <Text style={{fontSize: 40, color: 'white'}}>+</Text>
                </TouchableHighlight>
                <TouchableHighlight onPress={this.handleBackClick} style={styles.backButton}
                                underlayColor='teal'>
                    <Text style={{fontSize: 40, color: 'white'}}>⬅</Text>
                </TouchableHighlight>
                <NavigationEvents onDidFocus={this.navigatedBack} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    modalInnerWrapper: 
    {backgroundColor: 'black',
        opacity: 0.75,
        borderWidth: 1,
        borderColor: 'gray',
        width: 350,
        height: 150, alignItems: 'center', justifyContent: 'center',},
    closeModalButton: {
        backgroundColor: 'red',
        borderColor: 'red',
        borderWidth: 1,
        height: 40,
        width: 40,
        borderRadius: 50,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: "#000000",
        margin: 20,
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowOffset: {
            height: 1,
            width: 0
        },
    },
    checkModalButton: {
        backgroundColor: 'green',
        borderColor: 'green',
        borderWidth: 1,
        height: 40,
        width: 40,
        borderRadius: 50,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: "#000000",
        margin: 20,
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowOffset: {
            height: 1,
            width: 0
        },
    },
    checkWrapper: {
        flex: 1,
        alignItems: 'flex-end'
    },
    addButton: {
        backgroundColor: '#fe7a15',
        borderColor: '#fe7a15',
        borderWidth: 1,
        height: 70,
        width: 70,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 20,
        right:20,
        shadowColor: "#000000",
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowOffset: {
            height: 1,
            width: 0
        }
    },
    backButton: {
        backgroundColor: '#0191b4',
        borderColor: '#0191b4',
        borderWidth: 1,
        height: 70,
        width: 70,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 20,
        right:110,
        shadowColor: "#000000",
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowOffset: {
            height: 1,
            width: 0
        },
        paddingBottom: 20
    }
});