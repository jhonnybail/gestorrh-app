import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Alert, StyleSheet, View, TouchableWithoutFeedback, Button, Keyboard } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { NavigationActions } from 'react-navigation';
import { API_URL } from 'react-native-dotenv';
import { TextInputMask } from 'react-native-masked-text';

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        paddingLeft: 20,
        paddingRight: 20
    },
    logo: {
        width: 150,
        height: 150,
        marginTop: 20,
        backgroundColor: '#FFF',
        borderRadius: 75
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
    date: {
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

const TextInputAnimated = Animatable.createAnimatableComponent(TextInputMask)

class Valid extends React.Component {

    static navigationOptions = {
        headerShown: false
    };

    state = {
        empresa: JSON.parse('{"id":"8","fantasia":"Xplast ","logo":"https:\/\/www.gestorrh.com\/admin\/logo\/252c8dbc0c32b1fc24ed1f7e21ed180c."}'),
        colaborador: JSON.parse('{"id":"797","nombre":"Richard Ra\u00fal","apellido":"Acevedo Fern\u00e1ndez"}'),
        loaded: false
    }

    static get propTypes() {
        return {
            navigation: PropTypes.object,
            error: PropTypes.object,
            dispatch: PropTypes.func
        };
    }

    constructor(props) {
        super(props)
        if(props.navigation.state.params.empresa)
            this.state = {
                empresa: props.navigation.state.params.empresa,
                colaborador: props.navigation.state.params.colaborador,
                document: props.navigation.state.params.document,
                loaded: false
            }
    }

    componentDidMount() {
        setTimeout(() => this.loadCompany(), 1000)
    }
    
    loadCompany = async () => {
        this.props.dispatch({ type: 'wait' });
        const { empresa } = this.state;
        const result = await fetch(empresa.logo);
        const blob = await result.blob();
        const fileReaderInstance = new FileReader();

        fileReaderInstance.readAsDataURL(blob); 
        fileReaderInstance.onload = () => {
            this.props.dispatch({ type: 'ready' });
            const logo = fileReaderInstance.result; 
            
            this.setState({
                ...this.state,
                logo,
                loaded: true
            })
        }
    }

    onChangeBirth = date => {
        this.setState({
            ...this.state,
            date
        });
    }

    authenticate = async (company, document, birthDate) => {
        const fechaNascimento = `${birthDate.substr(6, 4)}-${birthDate.substr(3, 2)}-${birthDate.substr(0, 2)}`;
        const response = await fetch(`${API_URL}autorizacion/${document}/autenticar`, {
                                    method: 'post',
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        empresa: company,
                                        fechaNascimento
                                    })
                                });

        if(response.status === 401){
            const data = await response.json()

            throw new Error(data.message)
        }

        return response.json()
    }

    handleAccept = async () => {
        const { date, document, empresa, colaborador } = this.state;

        if(date === '' || date === null || date === undefined) {
            this.props.dispatch({ type: 'error', message: 'Fecha no informada.' })
            return;
        }

        Keyboard.dismiss();
        
        this.props.dispatch({ type: 'wait' });
        try {
            const cola = await this.authenticate(empresa.id, document, date);

            this.props.dispatch({ type: 'auth', user: cola, company: empresa })

            this.nextStep()
        }catch(error){
            setTimeout(() => this.props.dispatch({ type: 'error', message: error.message }), 1000)
        }
        this.props.dispatch({ type: 'ready' });
    }

    nextStep = () => {
        return this.props.navigation.dispatch(
            NavigationActions.navigate({ 
                routeName: 'resume'
            })
        );
    };

    render () {
        const { colaborador, logo, loaded, date, document } = this.state;
        const animationTextInput = {
            0: {
                width: '0%'
            },
            1: {
                width: '100%'
            }
        }

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={styles.container}>
                { loaded
                    ?   <View style={styles.container}>
                            <Animatable.Text animation="fadeIn" delat={1000} style={styles.welcome}>¡Hola {colaborador.nombre}!</Animatable.Text>
                            <Animatable.Text animation="fadeInUp" delay={500} style={styles.enter}>Actualmente estás en la empresa</Animatable.Text>
                            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                <Animatable.Image resizeMode="contain" delay={1000} resizeMethod="scale" animation="fadeInUp" source={{uri: logo}} style={styles.logo} />
                            </View>
                            <Animatable.Text animation="fadeInUp" delay={1000} style={styles.enter}>Ingrese su fecha de nacimiento</Animatable.Text>
                            <TextInputAnimated type={'datetime'} options={{ format: 'DD/MM/YYYY' }} maxLength={10} style={styles.date} underlineColorAndroid='transparent' keyboardType='numeric' animation={animationTextInput} value={date} onChangeText={date => this.onChangeBirth(date)} />
                            <View style={styles.button}>
                                <Button title="ACEPTAR" color="#62bfd4" onPress={this.handleAccept} />
                            </View>
                            <View style={styles.button}>
                                <Button title="VOLVER" color="#F00" onPress={() => this.props.navigation.dispatch(NavigationActions.navigate({ routeName: 'document', params: { document } }))} />
                            </View>
                        </View>
                    :   <></>
                }
            </TouchableWithoutFeedback>
        );
    }

}

export default connect(state => ({error: state.error}))(Valid);
