import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Provider } from 'react-redux';

import { Navigator } from './navigation';
import store from './store';
import WaitDialog from './components/WaitDialog';
import StatusBar from './components/StatusBar';

const styles = StyleSheet.create({
    body: {
        width: '100%',
        backgroundColor: '#001f4b'
    },
    screen: {
        width: '100%',
        height: '100%',
        backgroundColor: '#001f4b',
        overflow: 'hidden'
    }
});

class App extends React.Component {

    state = {
        componentHeight: Dimensions.get('screen').height - 20
    }

    render () {

        const {componentHeight} = this.state;
        
        return (
            <>
                <StatusBar />
                <View 
                    style={{...styles.body, height: componentHeight}}>
                    <View style={styles.screen}>
                        <Provider store={store}>
                            <WaitDialog />
                            <Navigator style={{margin: 10}} />
                        </Provider>
                    </View>
                </View>
            </>
        );
    }
}

export default App;
