import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Alert, StyleSheet, View, TouchableWithoutFeedback, Button, TextInput, Keyboard } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { NavigationActions } from 'react-navigation';
import { API_URL } from 'react-native-dotenv'

import logoGestorRH from '../../../assets/logo-azul.jpg';

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        paddingLeft: 20,
        paddingRight: 20
    },
    logo: {
        width: '100%',
        height: 72,
        marginTop: 20
    },
    slogan: {
        color: '#62bfd4',
        fontSize: 18,
        textAlign: 'center'
    },
    welcome: {
        color: '#FFF',
        fontSize: 30,
        textAlign: 'center',
        marginTop: 50
    },
    enter: {
        color: '#3b7582',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20
    },
    document: {
        borderBottomColor: '#62bfd4',
        borderBottomWidth: 5,
        height: 50,
        fontSize: 40,
        textAlign: 'center',
        color: '#FFF',
        marginTop: 20
    },
    button: {
        marginTop: 20
    }
});

const TextInputAnimated = Animatable.createAnimatableComponent(TextInput)

class DocumentScreen extends React.Component {

    static navigationOptions = {
        headerShown: false
    };

    state = {
        document: ''
    }

    static get propTypes() {
        return {
            navigation: PropTypes.object,
            dispatch: PropTypes.func
        };
    }

    onChangeDocument = document => {
        this.setState({
            ...this.state,
            document
        })
    }

    fetchEmpresa = async document => {
        const response = await fetch(`${API_URL}autorizacion/${document}/comprobar`);
        
        if(response.status === 404){
            const data = await response.json()

            throw new Error(data.message)
        }

        return response.json()
    }

    handleAccept = async () => {
        const { document } = this.state;

        if(document === '') {
            this.props.dispatch({ type: 'error', message: 'Documento no informado.' })
            return;
        }

        Keyboard.dismiss();
        
        this.props.dispatch({ type: 'wait' });
        try {
            const data = await this.fetchEmpresa(document);

            this.nextStep(data)
        }catch(error){
            setTimeout(() => this.props.dispatch({ type: 'error', message: error.message }), 1000)
        }
        this.props.dispatch({ type: 'ready' });
    }

    nextStep = data => {
        const { document } = this.state;

        return this.props.navigation.dispatch(
            NavigationActions.navigate({ 
                routeName: 'authenticate',
                params: {
                    ...data,
                    document
                }
            })
        );
    };

    componentDidMount() {
        const { navigation } = this.props;

        navigation.addListener('willFocus', e => {
            if(e.action.params && e.action.params.document) 
                this.setState({ document: e.action.params.document });
        });
        navigation.addListener('didBlur', () => {
            this.setState({ document: '' })
        });
    }

    render () {
        let { document } = this.state;
        const { navigation } = this.props;
        const animationTextInput = {
            0: {
                width: '0%'
            },
            1: {
                width: '100%'
            }
        }

        if(document === '' && navigation.state.params && navigation.state.params.document) {
            document = navigation.state.params.document
        }

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={styles.container}>
                <View style={styles.container}>
                    <Animatable.Image resizeMode="contain" resizeMethod="scale" animation="slideInDown" source={logoGestorRH} style={styles.logo} />
                    <Animatable.Text animation="fadeIn" delay={1000} style={styles.slogan}>Gestor de Recursos Humanos</Animatable.Text>
                    <Animatable.Text animation="fadeIn" delay={1000} style={styles.welcome}>¡Bienvenido!</Animatable.Text>
                    <Animatable.Text animation="fadeIn" delay={1000} style={styles.enter}>Para acceder informe su documento:</Animatable.Text>
                    <TextInputAnimated ref="document" style={styles.document} underlineColorAndroid='transparent' keyboardType='numeric' animation={animationTextInput} value={document} onChangeText={text => this.onChangeDocument(text)} />
                    <View style={styles.button}>
                        <Button title="SEGUIR" style color="#62bfd4" onPress={this.handleAccept} />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }

}

export default connect()(DocumentScreen);
