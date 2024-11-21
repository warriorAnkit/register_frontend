/* ROUTERS  */
export const ROUTES = {
  MAIN: '/',
  LOGOUT: '/logout',
  SIGNUP: '/signup',
  LOGIN: '/login',
  FORGET_PASSWORD: '/forgot-password',
  RESET: '/reset-password',
  VERIFY: '/verify',
  AUTHENTICATION: '/authentication',
  MOVIES: '/movies',
  MOVIE_DETAIL: '/movies/:id',
  ADD_MOVIES: '/movies/add',
  EDIT_MOVIES: '/movies/edit/:id',
  TABLE: '/tables',
  SAMPLE: '/sample',
  PROFILE: '/profile',
  NEW_REGISTER: '/register/new/:registerName',
  REGISTER_TEMPLATE_VIEW: '/register/template-view/:templateId',
  FILL_TEMPLATE:'/register/fill-template/:templateId',
  LOGS:'/logs',
  VIEW_ENTRIES:'/register/view-entries/:templateId',
  EDIT_ENTRIES:'/register/edit-entries/:templateId/:setId',
  GLOBAL_TEMPLATE_VIEW:'/register/global-template-view/:globalTemplateId',
  PREVIEW_REGISTER:'/register/preview',
  VIEW_SET_CHANGE_LOG:'/register/response-change-log/:setId',
  VIEW_TEMPLATE_CHANGE_LOG:'/register/register-change-log/:templateId',
};
/*  Modules */
export const MODULES = {
  DASHBOARD: 'Dashboard',
  MOVIES: 'Movies',
  SAMPLE: 'Sample',
  REGISTER:'Register',
};

/* Authentication */
export const TOKEN = 'TOKEN';
export const REFRESH_TOKEN = 'REFRESH_TOKEN';
export const USER = 'USER';

export const ROLES = {
  SUPER_ADMIN: 'Super admin',
  ADMIN: 'Admin',
};

export const ROLE_KEYS = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
};

/* Date and time */
export const defaultDateFormat = 'MM/DD/YYYY';

export const REGEX = {
  NAME: /^[a-z ,.'-]+$/i,
  ZIPCODE: /^[0-9]{5,6}$/,
  CITY: /^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/,
  WEB_URL: /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
  PASSWORD: /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{8,16}$/,
  PHONE: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  EMAIL: /^(([^<>()[\]\\.,;:!#$*%^'`~={}?/&\s@"]+(\.[^<>()[\]\\.,;:!#$*%^'`~={}?/&\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  AMOUNT: /^\d+$|^\d+\.\d*$/,
  OPTIONALNEGATIVEAMOUNT: /^[-]?\d+$|^[-]?\d+\.\d*$/,
  NUMBER: /^\d+$/,
  COUNTRY_CODE_PHONE: /^[0-9]{7,12}$/,
};

export const LIMIT = 10;
export const SCROLL_PERCENT = 0.85;

export const MOVIES_SORT_FIELD = [
  { name: 'Created At', value: 'createdAt' },
  { name: 'Updated At', value: 'updatedAt' },
  { name: 'Release Date', value: 'releaseDate' },
  { name: 'Popularity', value: 'popularity' },
  { name: 'Rate', value: 'voteAverage' },
];
export const ORDER = [
  { name: 'Ascending', value: 'ASC' },
  { name: 'Descending', value: 'DESC' },
];

export const CREDIT_TYPE = [
  { name: 'Cast', value: 'CAST' },
  { name: 'Crew', value: 'CREW' },
];

export const GENDER = [
  { name: 'Female', value: 'FEMALE' },
  { name: 'Male', value: 'MALE' },
  { name: 'Other', value: 'OTHER' },
];
export const ERROR_PAGE_TITLE = 'Oops! An error occurred!';
export const ERROR_PAGE_SUBTITLE =
  'Something is broken. Please let us know what you were doing when this error occurred. We will fix it as soon as possible. Sorry for any inconvenience caused.';

export const GUTTER_VARIATIONS = { xs: 16, sm: 16, md: 24, lg: 32 };

export const MOVIE_STATUS = {
  PENDING: 'Pending',
  RELEASED: 'Released',
};

export const BREAKPOINTS = {
  mobile: 550,
  tablet: 767,
  desktop: 1000,
  hd: 1200,
};
