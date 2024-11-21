import { useMutation } from '@apollo/client';
import React, { useContext, useEffect } from 'react';
import { AppContext } from '../../AppContext';
import LoaderComponent from '../../components/LoaderComponent';
import useRouter from '../../hooks/useRouter';
import { LOGOUT_USER } from './graphql/Queries';

const Logout = () => {
  const { dispatch } = useContext(AppContext);
  const { navigate } = useRouter();
  const [logout, { loading, error, data }] = useMutation(LOGOUT_USER, {
    onError() {},
  });

  useEffect(() => {
    logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoaderComponent />;

  if (error) {
    if (error?.graphQLErrors?.length) {
      dispatch({ type: 'LOGOUT' });
      // eslint-disable-next-line no-undef
      window.location = '/login';
      return null;
    }

    navigate(-1);
    return null;
  }

  if (data) {
    dispatch({ type: 'LOGOUT' });
    // eslint-disable-next-line no-undef
    window.location = '/login';
    return null;
  }

  return null;
};

export default Logout;
