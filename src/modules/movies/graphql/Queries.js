import { gql } from '@apollo/client';

export const LIST_MOVIES = gql`
  query listMovies($sort: ListMoviesSort, $filter: ListMoviesFilter) {
    listMovies(sort: $sort, filter: $filter) {
      count
      data {
        id
        homePage
        originalLanguage
        originalTitle
        overview
        title
        popularity
        releaseDate
      }
    }
  }
`;

export const MOVIE = gql`
  query movie($id: ID!) {
    movie(id: $id) {
      data {
        id
        adult
        budget
        homePage
        originalLanguage
        originalTitle
        overview
        releaseDate
        revenue
        runtime
        status
        tagline
        title
        createdAt
        genres {
          id
          name
        }
        languages {
          id
          languageCode
          englishName
        }
        countries {
          id
          countryCode
          englishName
        }
        castAndCrew {
          id
          name
          creditType
          department
          job
          character
          characterAdult
          characterGender
        }
        imageUrl
      }
    }
  }
`;

export const LIST_GENRES = gql`
  query {
    listGenre {
      id
      name
    }
  }
`;

export const COUNTRIES = gql`
  query countries($filter: CountriesFilter) {
    countries(filter: $filter) {
      count
      data {
        id
        countryCode
        englishName
      }
    }
  }
`;

export const LANGUAGES = gql`
  query languages($filter: LanguagesFilter) {
    languages(filter: $filter) {
      count
      data {
        id
        languageCode
        englishName
      }
    }
  }
`;

export const LIST_PERSONS = gql`
  query listPersons($filter: ListPersonsFilter!, $sort: ListPersonsSort!) {
    listPersons(filter: $filter, sort: $sort) {
      count
      data {
        id
        name
      }
    }
  }
`;

export const LIST_MOVIE_CREDITS = gql`
  query listMovieCredits($id: ID!, $filter: ListCreditMovieFilter) {
    listMovieCredits(id: $id, filter: $filter) {
      data {
        id
        creditType
        department
        job
        character
        characterAdult
        characterGender
        person {
          id
          name
        }
      }
      count
    }
  }
`;

export const GET_MOVIES_SIGNED_URL = gql`
  query getMoviesSignedPutUrl($data: MoviesSignedPutUrlDataInput!) {
    getMoviesSignedPutUrl(data: $data) {
      signedUrl
      key
    }
  }
`;
