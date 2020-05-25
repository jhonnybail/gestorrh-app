import React from 'react';
import { connect } from 'react-redux';
import localStorage from 'react-native-local-storage';
import { NavigationActions } from 'react-navigation'
import { API_URL } from 'react-native-dotenv';

class HomeScreen extends React.Component {

    static navigationOptions = ({navigation}) => {
        return {
            headerShown: false
        };
    };

    isLogged = async () => (await localStorage.get('user')) || null

    async componentDidMount() {
        const isLogged = await this.isLogged()

        if (isLogged){
            const json = await localStorage.get('user');
            const collaborator = json ? JSON.parse(json) : null;
            
            if(collaborator) {
                const isValid = await this.isValidCollaborator(collaborator)

                if(isValid) this.props.dispatch(NavigationActions.navigate({ routeName: 'resume' }))
                else this.props.dispatch(NavigationActions.navigate({ routeName: 'document' }))
            }
        }else this.props.dispatch(NavigationActions.navigate({ routeName: 'document' }))
    }

    isValidCollaborator = async collaborator => {
        const response = await fetch(`${API_URL}colaborador/${collaborator.id}`);
        const json = await response.json()

        return json.trabajo.fechasalida === undefined;
    }

    render () {
        return (<></>)
    }

}

export default connect()(HomeScreen);
