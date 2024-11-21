import { useMutation } from '@apollo/client';
import React from 'react';
import { CREATE_MOVIE } from './graphql/Mutations';
import MoviesForm from './MoviesForm';

function AddMovie() {
  const [createMovie] = useMutation(CREATE_MOVIE, {
    onError() {},
  });

  return <MoviesForm mutation={createMovie} />;
}

export default AddMovie;
