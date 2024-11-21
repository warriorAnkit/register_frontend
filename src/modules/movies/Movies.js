import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useLazyQuery, useMutation } from '@apollo/client';
import {
  Button,
  Card,
  Col,
  FloatButton,
  Modal,
  Row,
  Select,
  Space,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { map } from 'lodash';
import React, { useEffect, useState } from 'react';
import imagePlaceholder from '../../assets/images/imagePlaceholder.png';
import {
  LIMIT,
  MOVIES_SORT_FIELD,
  ORDER,
  ROUTES,
  defaultDateFormat,
} from '../../common/constants';
import EmptyStatePage from '../../components/EmptyStatePage';
import LoaderComponent from '../../components/LoaderComponent';
import SearchComponent from '../../components/SearchComponent';
import useRouter from '../../hooks/useRouter';
import { DELETE_MOVIE } from './graphql/Mutations';
import { LIST_MOVIES } from './graphql/Queries';

const { Option } = Select;
const { confirm } = Modal;
const { Meta } = Card;
const { Text, Title } = Typography;

function Movies() {
  const { navigate } = useRouter();
  const [fieldName, setFieldName] = useState('createdAt');
  const [sort, setSort] = useState('DESC');
  const [searchText, setSearchText] = useState('');
  const [movies, setMovies] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [deleteMovie] = useMutation(DELETE_MOVIE, {
    onError() {},
  });
  const [fetchMovies, { refetch }] = useLazyQuery(LIST_MOVIES, {
    variables: {
      filter: { skip: 0, limit: LIMIT, searchTerm: searchText },
      sort: {
        field: fieldName,
        order: sort,
      },
    },
    fetchPolicy: 'network-only',
    onCompleted: (res) => {
      setMovies([...movies, ...res?.listMovies?.data]);
      if (res?.listMovies?.data?.length < LIMIT) {
        setHasMore(false);
      }
      setMoviesLoading(false);
    },
    onError: () => {
      setMoviesLoading(false);
    },
  });

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetAllFields = () => {
    setMoviesLoading(true);
    setMovies([]);
  };

  const handleDelete = async (id) => {
    confirm({
      title: 'Are you sure, you want to delete this movie?',
      centered: true,
      okText: 'Yes',
      cancelText: 'No',
      okType: 'primary',
      async onOk() {
        try {
          const response = await deleteMovie({
            variables: { id },
          });
          if (response?.data?.deleteMovie) {
            const data = await refetch({
              skip: 0,
              limit: LIMIT,
            });
            setMovies(data?.data?.listMovies?.data);
          }
        } catch (error) {
          return error;
        }
      },
    });
  };

  useEffect(() => {
    resetAllFields();
  }, [fieldName, sort, searchText]);

  const handleSearchChange = (text) => {
    setSearchText(text);
  };

  const handleScroll = async (event) => {
    const { target } = event;

    const { scrollTop, scrollHeight, offsetHeight } = target || {};
    const scrolledToBottom = scrollTop + offsetHeight >= scrollHeight - 5;
    if (scrolledToBottom && hasMore) {
      setMoviesLoading(true);
      await fetchMovies({
        variables: {
          filter: {
            skip: movies?.length,
            limit: LIMIT,
          },
        },
      });
    }
  };

  return (
    <>
      <Title className="site-page-header p-0 mb-8 mt-0" level={3}>
        Popular Movies
      </Title>
      <Card
        className="ant-body-scroll "
        title={
          <>
            <div className="movies-sidebar">
              <div className="movie-filter-left">
                <div className="movie-filter">
                  <Space size="small" wrap>
                    <Text type="secondary">Sort By</Text>
                    <Select
                      defaultValue={fieldName}
                      onChange={(e) => {
                        setFieldName(e);
                      }}
                    >
                      {map(MOVIES_SORT_FIELD, (field) => (
                        <Option key={field?.value} value={field?.value}>
                          {field?.name}
                        </Option>
                      ))}
                    </Select>
                    <Select
                      defaultValue={sort}
                      onChange={(e) => {
                        setSort(e);
                      }}
                    >
                      {map(ORDER, (orderType) => (
                        <Option key={orderType?.value} value={orderType?.value}>
                          {orderType?.name}
                        </Option>
                      ))}
                    </Select>
                  </Space>
                </div>
              </div>
              <div className="movie-filter-right">
                <div className="movie-filter">
                  <SearchComponent getData={handleSearchChange} />
                  <Button
                    className="ml-8"
                    key="1"
                    type="primary"
                    onClick={() => {
                      navigate(`${ROUTES?.ADD_MOVIES}`);
                    }}
                  >
                    Add Movie
                  </Button>
                </div>
              </div>
            </div>
          </>
        }
      >
        {moviesLoading && movies?.length === 0 && <LoaderComponent />}
        {!moviesLoading && movies?.length === 0 && <EmptyStatePage />}
        <FloatButton.BackTop
          // eslint-disable-next-line no-undef
          target={() => document.querySelector('.ant-card-body')}
          visibilityHeight={100}
        />
        <div className="card-body-wrapper" onScroll={handleScroll}>
          <Row gutter={[16, 16]}>
            {map(movies, (movie) => (
              <Col key={movie?.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card
                  cover={
                    <img
                      alt="example"
                      src={imagePlaceholder}
                      className="movie-poster"
                    />
                  }
                  onClick={() => {
                    navigate(`${ROUTES?.MOVIES}/${movie?.id}`);
                  }}
                  className="movie-tile pointer full-width"
                  actions={[
                    <Button
                      type="text"
                      key="edit"
                      onClick={(e) => {
                        e?.stopPropagation();
                        e?.preventDefault();
                        navigate(`${ROUTES?.MOVIES}/edit/${movie?.id}`);
                      }}
                    >
                      <EditOutlined />
                    </Button>,
                    <Button
                      key="delete"
                      type="text"
                      onClick={(e) => {
                        e?.stopPropagation();
                        e?.preventDefault();
                        handleDelete(movie?.id);
                      }}
                    >
                      <DeleteOutlined className="delete-icon" />
                    </Button>,
                  ]}
                >
                  <Meta
                    title={movie?.title}
                    description={
                      <Typography.Paragraph ellipsis={{ rows: 2 }}>
                        {dayjs(movie?.releaseDate)?.format(defaultDateFormat)}
                      </Typography.Paragraph>
                    }
                  />
                </Card>
              </Col>
            ))}
            {hasMore && moviesLoading && movies?.length > 0 && (
              <Col span={24}>
                <LoaderComponent setHeight={10} />
              </Col>
            )}
          </Row>
        </div>
      </Card>
    </>
  );
}

export default Movies;
