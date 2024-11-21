import { gql } from '@apollo/client';

export const CREATE_MOVIE = gql`
  mutation createMovie($data: MovieInput) {
    createMovie(data: $data) {
      message
      data {
        movie {
          id
        }
      }
    }
  }
`;

export const UPDATE_MOVIE = gql`
  mutation updateMovie($id: ID!, $data: UpdateMovieInput) {
    updateMovie(id: $id, data: $data) {
      message
      data {
        movie {
          id
          adult
          budget
        }
        genres
      }
    }
  }
`;

export const DELETE_MOVIE = gql`
  mutation deleteMovie($id: ID!) {
    deleteMovie(id: $id) {
      message
    }
  }
`;
