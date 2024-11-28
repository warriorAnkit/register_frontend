import { useLazyQuery } from '@apollo/client';
import { useState, useEffect } from 'react';
import { GET_USER_BY_ID } from '../modules/auth/graphql/Queries';


/**
 * A reusable hook to fetch the full name of a user based on their ID.
 * @returns {Function} fetchUserFullName - A function that accepts a userId and returns a Promise with the user's full name.
 */
const useFetchUserFullName = () => {
  const [userCache, setUserCache] = useState({});
  const [getUserById] = useLazyQuery(GET_USER_BY_ID);

  /**
   * Fetches the full name of a user based on their userId.
   * @param {string} userId - The ID of the user whose name is to be fetched.
   * @returns {Promise<string>} - A promise that resolves to the user's full name or 'Unknown User'.
   */
  const fetchUserFullName = async (userId) => {
    if (!userId) return 'Unknown User';

    // Return cached name if available
    if (userCache[userId]) {
      return userCache[userId];
    }

    try {
      const { data } = await getUserById({ variables: { userId } });
      const fullName = data?.getUserById
        ? `${data.getUserById.firstName} ${data.getUserById.lastName}`
        : 'Unknown User';

      // Cache the result
      setUserCache((prevCache) => ({
        ...prevCache,
        [userId]: fullName,
      }));

      return fullName;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching user name:', error);
      return 'Unknown User';
    }
  };

  return fetchUserFullName;
};

export default useFetchUserFullName;
