import { createBrowserHistory } from 'history';

const history = createBrowserHistory({ getUserConfirmation: () => {} });

export default history;
