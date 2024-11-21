import { useLazyQuery, useMutation } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UPDATE_MOVIE } from './graphql/Mutations';
import { MOVIE } from './graphql/Queries';
import MoviesForm from './MoviesForm';

function EditMovie() {
  const { id } = useParams();
  const [movieLoading, setMovieLoading] = useState(true);
  const [movieData, setMovieData] = useState(null);
  const [fetchMovie] = useLazyQuery(MOVIE, {
    onCompleted: (res) => {
      setMovieData(res?.movie?.data);
    },
    onError() {},
  });
  const [updateMovie] = useMutation(UPDATE_MOVIE, {
    onError() {},
  });

  useEffect(() => {
    if (id) {
      fetchMovie({
        fetchPolicy: 'network-only',
        variables: { id },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <MoviesForm
      mutation={updateMovie}
      movieData={movieData}
      edit
      dataLoading={movieLoading}
      setMovieLoading={setMovieLoading}
    />
  );
}

export default EditMovie;
