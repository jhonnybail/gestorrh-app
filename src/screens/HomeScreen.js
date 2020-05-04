import React from 'react';
import { connect } from 'react-redux';
import localStorage from 'react-native-local-storage';
import { NavigationActions } from 'react-navigation'

class HomeScreen extends React.Component {

    static navigationOptions = ({navigation}) => {
        return {
            headerShown: false
        };
    };

    isLogged = async () => (await localStorage.get('user')) || null

    async componentDidMount() {
        const isLogged = await this.isLogged()

        if (isLogged) this.props.dispatch(NavigationActions.navigate({ routeName: 'resume' }))
        else this.props.dispatch(NavigationActions.navigate({ routeName: 'document' }))
    }

    render () {
        return (<></>)
    }

}

export default connect()(HomeScreen);
