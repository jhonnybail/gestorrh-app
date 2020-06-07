import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Dimensions, FlatList, Image, Platform, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { NavigationActions } from 'react-navigation'
import { HeaderHeightContext } from 'react-navigation-stack';
import localStorage from 'react-native-local-storage';
import { Icon, Button } from 'react-native-elements';
import { API_URL } from 'react-native-dotenv';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';

const styles = StyleSheet.create({
    screen: {
        width: '100%',
        paddingLeft: 20,
        paddingRight: 20  
    },
    card: {
        height: 150,
        backgroundColor: '#22526f',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.36,
        shadowRadius: 6.68,
        elevation: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10 
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 150 
    },
    viewImage: {
        flex: 1,
        height: 150,
        backgroundColor: '#FFF',
        padding: 5,
        borderRadius: 10
    },
    collaboratorImage: {
        width: '100%',
        height: '100%'
    },
    viewInfo: {
        flex: 2,
        height: 150,
        padding: 10,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10
    },
    name: {
        fontSize: 15,
        color: '#FFF',
        fontWeight: 'bold',
        textAlign: 'left', 
        alignSelf: 'stretch'
    },
    surname: {
        fontSize: 12,
        color: '#FFF',
        fontWeight: 'bold',
        textAlign: 'left', 
        alignSelf: 'stretch'
    },
    title: {
        fontSize: 15,
        color: '#FFF',
        fontWeight: 'bold',
        textAlign: 'left', 
        alignSelf: 'stretch'
    },
    option: {
        fontSize: 14,
        color: '#FFF',
        textAlign: 'left', 
        alignSelf: 'stretch'
    },
    messageTitleBox: {
        marginTop: 25,
        marginBottom: 25,
        alignItems: "flex-start",
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    messageIcon: {

    },
    messageText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 18,
        color: '#FFF'
    },
    list: {
        marginTop: 10,
        paddingHorizontal: 5
    },
    itemMessage: {
        marginBottom: 10, 
        borderBottomColor: '#FFF', 
        borderBottomWidth: 1, 
        borderBottomLeftRadius: 5, 
        borderBottomRightRadius: 5,
        paddingBottom: 10
    }
});

class ResumeScreen extends React.Component {

    static navigationOptions = ({navigation}) => {        
        return {
            headerShown: true,
            title: 'Resumen',
            headerLeft: () => null,
            headerRight: () => (
                <Button
                    onPress={() => {
                        navigation.dispatch({
                            type: 'signout'
                        });
                    }}
                    icon={
                        <Icon
                            name='exit-to-app'
                            iconRight
                            color='#FFF' />
                    }
                    type="clear"
                    title="Salir"
                    titleStyle={{
                        color: '#FFF',
                        marginLeft: 5
                    }}
                />
            )
        };
    };

    state = {
        collaborator: null,
        messages: [],
        loaded: false
    }

    static get propTypes() {
        return {
            navigation: PropTypes.object,
            dispatch: PropTypes.func
        };
    }

    registerForPushNotificationsAsync = async () => {
        const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
        const { collaborator } = this.state;
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            finalStatus = status;
        }
        
        const token = await Notifications.getExpoPushTokenAsync();
        
        try {
            await fetch(`${API_URL}colaborador/${collaborator.id}/dispositivo`, {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token
                })
            });
        } catch(e) { console.log(e) }

        if (Platform.OS === 'android') {
            Notifications.createChannelAndroidAsync('default', {
                name: 'Messages',
                sound: true,
                priority: 'max',
                vibrate: [0, 250, 250, 250],
            });
        }
    };

    loadScreen = async () => {
        const json = await localStorage.get('user');
        let collaborator = json ? JSON.parse(json) : null;

        if(collaborator){
            this.props.dispatch({ type: 'wait' });
            collaborator = await this.loadCollaboratorInfo(collaborator);
            const messages = await this.loadMessages();
            this.setState({
                ...this.state,
                collaborator,
                messages,
                loaded: true
            });
            this.props.dispatch({ type: 'ready' });
            
            this.registerForPushNotificationsAsync();
            this._notificationSubscription = Notifications.addListener(this._handleNotification);
        }else {
            this.loginScreen();
        }
    }

    _handleNotification = async () => {
        if(this.state.loaded) {
            this.props.dispatch({ type: 'wait' });
            const messages = await this.loadMessages();
            this.setState({
                ...this.state,
                messages
            });
            this.props.dispatch({ type: 'ready' });
        }
    };

    loginScreen = () => {
        this.props.navigation.dispatch(
            NavigationActions.navigate({ 
                routeName: 'document'
            })
        );
    }

    logout = () => {
        this.setState({
            ...this.state,
            collaborator: null,
            messages: []
        })
    }

    loadCollaboratorInfo = async user => {
        if(user.foto) {
            const result = await fetch(user.foto);
            const blob = await result.blob();
            const fileReaderInstance = new FileReader();
            
            fileReaderInstance.readAsDataURL(blob); 

            return new Promise(resolve => {
                fileReaderInstance.onload = () => {
                    user.fotoData = fileReaderInstance.result;
                    resolve(user);
                }
            });
        }

        return user;
    }

    loadMessages = async () => {
        const json = await localStorage.get('user');
        const collaborator = json ? JSON.parse(json) : null;
        const result = await fetch(`${API_URL}colaborador/${collaborator.id}/mensajes`);

        return result.json();
    }

    renderItem = (item) => (
        <TouchableOpacity
            onPress={() => this.openDetail(item)}>
            <Animatable.View animation="fadeInUp" iterationCount={1} style={styles.itemMessage}>
                <View
                    style={{
                        alignItems: "flex-start",
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}>
                    <Icon
                        name='info'
                        color='#FFF' />
                    <Text style={{fontSize: 16, color: '#CCC', flex: 1, marginTop: 2, marginLeft: 5}}>{item.titulo}</Text>
                </View>
                <Text style={{fontSize: 14, color: '#999', margin: 10}}>{item.notificacion}</Text>
            </Animatable.View>
        </TouchableOpacity>
    )

    openDetail = message => {
        return this.props.navigation.dispatch(
            NavigationActions.navigate({ 
                routeName: 'messageDetail',
                params: {
                    message
                }
            })
        );
    };

    componentDidMount() {
        this.loadScreen();
        this.props.navigation.addListener('willFocus', () => this.loadScreen());
        this.props.navigation.addListener('willBlur', e => {
            if(e.action.routeName === 'document') this.logout();
        });
    }

    render () {
        const { collaborator } = this.state;

        return collaborator
            ?   (
                    <HeaderHeightContext.Consumer>
                    {headerHeight => (
                        <View>
                            <View style={{...styles.screen, height: Dimensions.get('window').height - 60 - headerHeight}}>
                                <Animatable.View animation="fadeInDown" style={{...styles.card}}>
                                    <View style={styles.container}>
                                        <View style={styles.viewImage}>
                                            { collaborator.fotoData 
                                                ?    <Image 
                                                        resizeMode="contain" 
                                                        source={{uri: collaborator.fotoData}} 
                                                        style={styles.collaboratorImage} />
                                                : <></>
                                            }
                                        </View>
                                        <View style={{...styles.viewInfo}}>
                                            <Text style={styles.name}>{collaborator.personales.nombre}</Text>
                                            <Text style={styles.surname}>{collaborator.personales.apellido}</Text>
                                            <Text style={{...styles.title, marginTop: 10}}>Unidad de Trabajo</Text>
                                            <Text style={styles.option}>{collaborator.trabajo.unidadtrabajo.descripcion}</Text>
                                        </View>
                                    </View>
                                </Animatable.View>
                                <Animatable.View style={styles.messageTitleBox} animation="fadeInUp">
                                    <Icon
                                        name='comment'
                                        color='#FFF'
                                        style={styles.messageIcon} />
                                    <Text style={styles.messageText}>Mensajes</Text>
                                </Animatable.View>
                                <FlatList
                                    contentContainerStyle={styles.list}
                                    data={this.state.messages}
                                    renderItem={({item}) => this.renderItem(item)}
                                    keyExtractor={item => `${item.id}`}
                                />
                            </View>
                            <View style={{ width: '100%', height: 60 }}>
                                <Text style={{ textAlign: 'center', marginTop: 7, color: '#FFF' }}>un producto RH Empresa</Text>
                            </View>
                        </View>
                    )}
                    </HeaderHeightContext.Consumer>
                )
            : (<></>)
    }

}

export default connect()(ResumeScreen);
