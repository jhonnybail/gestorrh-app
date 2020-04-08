
const initialState = {
    message: null
};
  
export const error = (state = initialState, { type, message = null }) => {
    switch (type) {
        case 'error':
            return {
                ...state,
                message: message
            }
        default:
            return state;
    }
};