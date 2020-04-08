import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dimensions } from 'react-native';
import { ProgressDialog } from "react-native-simple-dialogs";

class WaitDialog extends Component {

  render() {

    const { visible, message } = this.props;
    let style = {
      backgroundColor: '#001f4b', 
      width: 80, 
      height: 75, 
      left: (Dimensions.get('screen').width/2) - 60
    };
    let textStyle;
    
    if(message !== "" && message !== null && message !== undefined) {
      delete style.left;
      delete style.width;
      textStyle = {
        color: '#FFF',
        fontSize: 15
      }
    }
    
    return <ProgressDialog
              activityIndicatorColor="white"
              activityIndicatorSize="large"
              animationType="slide"
              message={ message || '' }
              messageStyle={ textStyle }
              dialogStyle={ style }
              visible={ visible }
              />
  }
}

export default connect(state => state.wait)(WaitDialog);
