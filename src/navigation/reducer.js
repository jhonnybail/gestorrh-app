import {
    createReactNavigationReduxMiddleware,
    createNavigationReducer,
} from 'react-navigation-redux-helpers';

export default (AppNavigator) => {
    const navReducer = createNavigationReducer(AppNavigator);
    const middleware = createReactNavigationReduxMiddleware(
        state => state.nav
    );
    return { navReducer, middleware };
};