import { gql } from '@apollo/client';

// eslint-disable-next-line import/prefer-default-export
export const GET_SIGNED_URL = gql`
  mutation generateSignedUrl($action: String!, $data: signedUrlData!) {
    generateSignedUrl(action: $action, data: $data) {
      signedRequest
      url
    }
  }
`;
