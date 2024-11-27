/* eslint-disable no-console */
/* eslint-disable no-undef */
// /* eslint-disable no-undef */
// import React, { createContext, useReducer } from 'react';
// import client from './apollo';
// import api from './common/api';
// import { REFRESH_TOKEN, TOKEN, USER } from './common/constants';


// const logLocalStorage = () => {
//   // eslint-disable-next-line no-console
//   console.log("Local Storage Contents:");
//   // eslint-disable-next-line no-console
//   console.log(localStorage.length)
//   // eslint-disable-next-line no-plusplus
//   for (let i = 0; i < localStorage.length; i++) {
//     const key = localStorage.key(i);
//     const value = localStorage.getItem(key);
//     // eslint-disable-next-line no-console
//     console.log(`${key}: ${value}`);
//   }
// };

// const getLoggedInUser = () => {
//   // eslint-disable-next-line no-undef
//   let loggedInUser = localStorage?.getItem(USER);
//   loggedInUser = loggedInUser ? JSON?.parse(loggedInUser) : null;

//   return loggedInUser;
// };

// const initialState = {
//   currentUser: getLoggedInUser() || {},
//   // eslint-disable-next-line no-undef
//   authToken: localStorage?.getItem(TOKEN),
//   showPrompt: false,
// };

// const reducer = (state, action) => {
//   switch (action?.type) {
//     case 'SET_CURRENT_USER':
//       // eslint-disable-next-line no-case-declarations
//       const user = action?.data || {};

//       // eslint-disable-next-line no-undef
//       localStorage.setItem(
//         USER,
//         user && Object?.keys(user)?.length ? JSON?.stringify(user) : null,
//       );
//       return { ...state, currentUser: { ...user } };
//     case 'SET_CURRENT_ROLE':
//       return { ...state, currentRole: action?.data };
//     case 'LOGOUT':
//       delete api?.defaults?.headers?.common?.Authorization;
//       // eslint-disable-next-line no-undef
//       localStorage?.clear();
//       client?.clearStore();
//       return {
//         ...initialState,
//         authenticated: false,
//         authToken: null,
//         user: {},
//       };
//     case 'SET_FETCHING_USER_DETAILS':
//       return { ...state, fetchingUserDetails: action?.data };
//     case 'SET_AUTHENTICATED':
//       return { ...state, authenticated: action?.data };
//     case 'SET_TOKEN':
//       // eslint-disable-next-line no-undef
//       localStorage.setItem(TOKEN, action?.data);
//       return { ...state, authToken: action?.data };
//     case 'SET_REFRESH_TOKEN':
//       // eslint-disable-next-line no-undef
//       localStorage.setItem(REFRESH_TOKEN, action?.data);
//       return {
//         ...state,
//         refreshToken: action?.data,
//       };
//     case 'SET_INITIAL_SHOW_ALL_FIELDS_STATUS':
//       return { ...state, initialShowAllFieldStatus: action?.data };
//     default:
//       return { ...state };
//   }
// };

// const AppContext = createContext({
//   state: initialState,
//   dispatch: () => {},
// });

// function AppContextProvider({ children }) {
//   const [state, dispatch] = useReducer(reducer, initialState);

//   // eslint-disable-next-line no-console
//   console.log("HII",localStorage?.getItem(TOKEN));
//   const getToken = () =>
//     // eslint-disable-next-line no-undef
//     localStorage?.getItem(TOKEN) || null;
//   const getRefreshToken = () =>
//     // eslint-disable-next-line no-undef
//     localStorage?.getItem(REFRESH_TOKEN);
//   const getCurrentUser = () =>
//     // eslint-disable-next-line no-undef
//     localStorage?.getItem(USER)
//       ? // eslint-disable-next-line no-undef
//         JSON?.parse(localStorage?.getItem(USER))
//       : {};
//   const getCurrentUserRole = () => {
//     const loggedInUser = getLoggedInUser();
//     return loggedInUser?.roles?.[0] || '';
//   };

//   const isAuthenticated = () => state?.authenticated;

//   const initializeAuth = (authToken, userData, refreshToken) => {
//     const token = authToken || getToken();
//     const user = userData || getCurrentUser();
//     const refresh = refreshToken || getRefreshToken();
//     if (token) {
//       api.defaults.headers.common.Authorization = `Bearer ${token}`;
//       dispatch({ type: 'SET_TOKEN', data: token });
//       dispatch({ type: 'SET_REFRESH_TOKEN', data: refresh });
//       dispatch({ type: 'SET_AUTHENTICATED', data: true });
//       dispatch({ type: 'SET_CURRENT_USER', data: user });
//       if (user?.roles?.[0]) {
//         dispatch({ type: 'SET_CURRENT_ROLE', data: user?.roles?.[0] });
//       }
//     }
//      logLocalStorage(); // Add this line
//     // eslint-disable-next-line no-console
//     console.log('Initializing Auth:', { token, user, refresh });
//   };

//   const value = {
//     state,
//     dispatch,
//     isAuthenticated,
//     getToken,
//     getRefreshToken,
//     initializeAuth,
//     getCurrentUserRole,
//     getCurrentUser,
//   };

//   return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
// }

// const AppContextConsumer = AppContext?.Consumer;

// export { AppContext, AppContextConsumer, AppContextProvider };
import React, { createContext, useEffect, useReducer } from 'react';
import client from './apollo';
import api from './common/api';
import { REFRESH_TOKEN, TOKEN, USER } from './common/constants';

// Utility function to log localStorage contents (for debugging)
const logLocalStorage = () => {

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);

  }
};

// Function to get logged-in user from localStorage
const getLoggedInUser = () => {
  const loggedInUser = localStorage.getItem(USER);
  return loggedInUser ? JSON.parse(loggedInUser) : null;
};

// Initial state setup
const initialState = {
  currentUser: getLoggedInUser() || {},
  authToken: localStorage.getItem(TOKEN),
  showPrompt: false,
};

// Reducer function to handle actions
const reducer = (state, action) => {
  switch (action?.type) {
    case 'SET_CURRENT_USER':
      // eslint-disable-next-line no-case-declarations
      const user = action?.data || {};
      localStorage.setItem(USER, Object.keys(user).length ? JSON.stringify(user) : null);
      return { ...state, currentUser: user };

    case 'SET_CURRENT_ROLE':
      return { ...state, currentRole: action?.data };

    case 'LOGOUT':
      delete api.defaults.headers.common.Authorization;
      localStorage.clear();
      client.clearStore();
      return {
        ...initialState,
        authenticated: false,
        authToken: null,
        user: {},
      };

    case 'SET_FETCHING_USER_DETAILS':
      return { ...state, fetchingUserDetails: action?.data };

    case 'SET_AUTHENTICATED':
      return { ...state, authenticated: action?.data };

    case 'SET_TOKEN':
      localStorage.setItem(TOKEN, action?.data);
      return { ...state, authToken: action?.data };

    case 'SET_REFRESH_TOKEN':
      localStorage.setItem(REFRESH_TOKEN, action?.data);
      return { ...state, refreshToken: action?.data };

    case 'SET_INITIAL_SHOW_ALL_FIELDS_STATUS':
      return { ...state, initialShowAllFieldStatus: action?.data };

    default:
      return state;
  }
};

// Create the context
const AppContext = createContext({
  state: initialState,
  dispatch: () => {},
});

// Main context provider component
function AppContextProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Get token from localStorage
  const getToken = () => localStorage.getItem(TOKEN) || null;

  // Get refresh token from localStorage
  const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN);

  // Get the current user from localStorage
  const getCurrentUser = () => {
    const user = localStorage.getItem(USER);
    return user ? JSON.parse(user) : {};
  };

  // Get the current user's role
  const getCurrentUserRole = () => {
    const loggedInUser = getLoggedInUser();
    return loggedInUser?.roles?.[0] || '';
  };

  // Check if the user is authenticated
  const isAuthenticated = () => state?.authenticated;

  // Function to initialize authentication
  const initializeAuth = (authToken, userData, refreshToken) => {
    const token = authToken || getToken();
    const user = userData || getCurrentUser();
    const refresh = refreshToken || getRefreshToken();

    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      dispatch({ type: 'SET_TOKEN', data: token });
      dispatch({ type: 'SET_REFRESH_TOKEN', data: refresh });
      dispatch({ type: 'SET_AUTHENTICATED', data: true });
      dispatch({ type: 'SET_CURRENT_USER', data: user });

      if (user?.roles?.[0]) {
        dispatch({ type: 'SET_CURRENT_ROLE', data: user?.roles?.[0] });
      }
    }

    logLocalStorage(); // Log localStorage contents for debugging
    // console.log('Initializing Auth:', { token, user, refresh });
  };

  // Effect to initialize auth when the app first mounts (on page refresh)
  useEffect(() => {
    const token = getToken();
    const user = getCurrentUser();
    const refreshToken = getRefreshToken();

    if (token && user) {
      initializeAuth(token, user, refreshToken);
    } else {
      dispatch({ type: 'SET_AUTHENTICATED', data: false });
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Context value to be passed down to components
  const value = {
    state,
    dispatch,
    isAuthenticated,
    getToken,
    getRefreshToken,
    initializeAuth,
    getCurrentUserRole,
    getCurrentUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Export the context and provider for use in other components
const AppContextConsumer = AppContext.Consumer;

export { AppContext, AppContextConsumer, AppContextProvider };
