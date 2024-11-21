import { gql } from '@apollo/client';

export const LOGOUT_USER = gql`
  mutation logout {
    logout {
      message
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation refreshToken($data: RefreshTokenInput!) {
    refreshToken(data: $data) {
      token
      user {
        id
        email
        profileImage
        name
        firstName
        lastName
      }
    }
  }
`;


export const GET_CURRENT_USER = gql`
  query getCurrentUser {
    getCurrentUser {
      id
      email
      firstName
      lastName
      role
    }
  }

`;
export const GET_USER_BY_ID = gql`
  query GetUserById($userId: ID!) {
    getUserById(userId: $userId) {
      firstName
      lastName
    }
  }
`;