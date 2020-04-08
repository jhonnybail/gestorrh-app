import { Alert } from 'react-native';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { navReducer, middleware } from './navigation';
import { error as errorReducer } from './reducer/error';
import { wait as waitReducer } from './reducer/wait';
import localStorage from 'react-native-local-storage';

const rootReducer = combineReducers({
    nav: navReducer,
    error: errorReducer,
    wait: waitReducer
});

const errorMiddleware = store => next => action => {
    switch (action.type){
        case 'error':
            Alert.alert(action.title || '', action.message)
        break
    }
    next(action);
};

const authMiddleware = store => next => async action => {
    switch (action.type){
        case 'auth':
            await localStorage.save('user', JSON.stringify(action.user));
            await localStorage.save('company', JSON.stringify(action.company));
        break
    }
    next(action);
}

const store = createStore(
    rootReducer,
    applyMiddleware(...[middleware, errorMiddleware, authMiddleware]),
);

export default store;
