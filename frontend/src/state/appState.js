// frontend/src/state/appState.js
export const LOCAL_STORAGE_KEY = 'skillPortalAuth';

export const initialAppState = {
  user: null,
  isAuthenticated: false,
  currentPage: 'login',
  loading: false,
  error: null,
};

export const appReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(action.payload));
      localStorage.setItem('token', action.payload.token || '');
      return { ...state, user: action.payload, isAuthenticated: true, currentPage: action.payload.role === 'admin' ? 'admin' : 'dashboard', error: null };
    case 'LOGOUT':
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem('token');
      return { ...initialAppState, currentPage: 'login' };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};
