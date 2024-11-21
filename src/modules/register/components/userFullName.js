import { useLazyQuery } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { GET_USER_BY_ID } from '../../auth/graphql/Queries';



const FullNameById = (userId) => {
  const [fullName, setFullName] = useState('');

// eslint-disable-next-line no-console, no-param-reassign, react/destructuring-assignment
userId = userId.userId;
  const [getUser, { data, loading, error }] = useLazyQuery(GET_USER_BY_ID);

  useEffect(() => {
    if (userId) {
      getUser({ variables: { userId } });
    }
  }, [userId, getUser]);


  useEffect(() => {
    if (data && data.getUserById) {
      setFullName(`${data.getUserById.firstName} ${data.getUserById.lastName}`);
    }
  }, [data]);

  if (loading) return 'Loading...'; // If data is still loading
  if (error) return 'Error fetching name'; // If an error occurred

  return <span>{fullName || 'Unknown User'}</span>;
};

export default FullNameById;
