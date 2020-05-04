import { createStackNavigator } from 'react-navigation-stack';

import HomeScreen from '../screens/HomeScreen';
import ResumeScreen from '../screens/ResumeScreen';
import MessageDetailScreen from '../screens/MessageDetailScreen';
import DocumentScreen from '../screens/auth/DocumentScreen';
import ValidScreen from '../screens/auth/ValidScreen';

const Routes = createStackNavigator({
    home: { screen: HomeScreen },
    resume: { screen: ResumeScreen },
    document: { screen: DocumentScreen },
    authenticate: { screen: ValidScreen },
    messageDetail: { screen: MessageDetailScreen }
}, {
    initialRouteName: 'home',
    headerMode: 'screen',
    defaultNavigationOptions: {
        headerTintColor: '#FFF',
        headerStyle: {
            height: 50,
            backgroundColor: '#001f4b',
            borderColor: '#001f4b',
            elevation: 1,
            shadowOpacity: 0,
            shadowColor: 'transparent',
            borderBottomWidth: 0,
            borderTopWidth: 0
        },
        headerForceInset: true,
        cardStyle: {
            backgroundColor: '#001f4b'
        }
    }
});

export default Routes;
