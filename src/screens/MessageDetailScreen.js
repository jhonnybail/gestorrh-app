import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import { Icon } from 'react-native-elements'
import { NavigationActions } from 'react-navigation';

const styles = StyleSheet.create({
    flex: {
        alignItems: "flex-start",
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 20,
        paddingRight: 20
    },
    text: {
        marginTop: 10,
        color: '#FFF'
    }
});

class MessageDetailScreen extends React.Component {

    static navigationOptions = {
        headerBackTitle: 'Principal',
        title: 'Mensajes'
    };

    static get propTypes() {
        return {
            navigation: PropTypes.object,
            dispatch: PropTypes.func
        };
    }

    render () {

        const { navigation } = this.props;
        const { message } = navigation.state.params;

        return (
            <>
                <View style={{...styles.flex, marginTop: 10}}>
                    <Icon
                        name='info'
                        color='#FFF'
                        onPress={this.goBack} />
                    <Text style={{fontSize: 16, color: '#FFF', flex: 1, marginTop: 2, marginLeft: 5}}>{message.titulo}</Text>
                </View>
                <Text style={styles.text}>
                    {message.texto}
                </Text>
            </>
        )
    }

}

export default connect()(MessageDetailScreen);
