import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    StatusBar as SB,
    Platform,
    Dimensions,
    NativeModules
} from 'react-native';
const { StatusBarManager } = NativeModules;
const { OS, Version } = Platform;

let StatusBarHeight = 20;

const getStatusBarHeigth = async () => new Promise(resolve => {
    if (OS === 'android') {
        if (Version >= 21) resolve(StatusBarManager.HEIGHT);
        else resolve(0);
    } else {
        StatusBarManager.getHeight(({ height }) => resolve(height));
    }
});

class StatusBar extends Component {

    state = {
        statusBarWidth: Dimensions.get('screen').width
    };

    static get propTypes () {
        return {
            barStyle: PropTypes.string,
            backgroundColor: PropTypes.string,
            translucent: PropTypes.bool,
            hidden: PropTypes.bool
        }
    }

    async shouldComponentUpdate() {
        StatusBarHeight = await getStatusBarHeigth();
    }

    onLayout = () => {
        this.setState({
            ...this.state,
            statusBarWidth: Dimensions.get('screen').width
        });
    }

    render() {
        const {
            barStyle, backgroundColor, translucent, hidden
        } = this.props;
        const bgColor = translucent ? '#00000000' : backgroundColor;
        const { width } = Dimensions.get('screen');
        const supportSO = OS === 'ios' || (OS === 'android' && Version >= 21);
        
        return (
            <View
                onLayout={this.onLayout}>
                <SB barStyle={barStyle} backgroundColor={bgColor} translucent hidden={hidden} />
                {!hidden && !translucent && supportSO ? <View style={{
                    backgroundColor: bgColor,
                    height: hidden ? 0 : StatusBarHeight,
                    width,
                    position: translucent ? 'absolute' : 'relative',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: hidden ? 0 : StatusBarHeight,
                }}
                /> : null}
            </View>
        );
    }

}

StatusBar.defaultProps = {
    barStyle: Platform.select({
        ios: 'light-content',
        android: 'light-content',
    }),
    backgroundColor: Platform.select({
        ios: '#001f4b',
        android: '#001f4b',
    }),
    translucent: false,
    hidden: false,
};

StatusBar.getStatusBarHeigth = () => StatusBarHeight;

export default StatusBar;
