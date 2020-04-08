
const initialState = {
    visible: false,
    message: ''
};
  
export const wait = (state = initialState, { type, message = '' }) => {
    switch (type) {
        case 'wait':
            return {
                ...state,
                visible: true,
                message: message
            }
        case 'ready':
            return initialState
        default:
            return state;
    }
};
