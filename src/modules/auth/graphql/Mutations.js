import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(data: { email: $email, password: $password }) {
      message
      data {
        id
        email
        firstName
        lastName
        profileImage
        role
        isActive
        lastActiveOn
      }
      accessToken
      refreshToken
    }
  }
`;

export const SIGNUP = gql`
  mutation emailPasswordSignUp($data: EmailPasswordSignUpData!) {
    emailPasswordSignUp(data: $data) {
      message
    }
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation emailPasswordForgotPassword(
    $data: EmailPasswordForgotPasswordData!
  ) {
    emailPasswordForgotPassword(data: $data) {
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation emailPasswordResetPassword($data: EmailPasswordResetPasswordData!) {
    emailPasswordResetPassword(data: $data) {
      message
    }
  }
`;

export const VERIFY_TOKEN = gql`
  mutation emailPasswordVerifyResetToken($token: String!) {
    emailPasswordVerifyResetToken(data: { token: $token }) {
      message
      data {
        isValidToken
      }
    }
  }
`;

export const UPDATE_CURRENT_USER = gql`
  mutation updateCurrentUser($data: UpdateCurrentUserInput!) {
    updateCurrentUser(data: $data) {
      message
      data {
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
