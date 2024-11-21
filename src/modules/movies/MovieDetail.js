import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useLazyQuery } from '@apollo/client';
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { map } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import imagePlaceholder from '../../assets/images/imagePlaceholder.png';
import { MOVIE_STATUS, defaultDateFormat } from '../../common/constants';
import { getTimeFromMins } from '../../common/utils';
import LoaderComponent from '../../components/LoaderComponent';
import useRouter from '../../hooks/useRouter';
import { MOVIE } from './graphql/Queries';

const { Text, Title } = Typography;
function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState({});
  const { navigate } = useRouter();
  const [fetchMovie, { data, loading }] = useLazyQuery(MOVIE, {
    fetchPolicy: 'network-only',
    onError() {},
  });
  useEffect(() => {
    if (id) {
      fetchMovie({
        variables: { id },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  useEffect(() => {
    setMovie(data?.movie?.data);
  }, [data]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleStatus = () => {
    switch (movie?.status) {
      case MOVIE_STATUS.PENDING:
        return <Tag color="warning">{movie?.status}</Tag>;

      case MOVIE_STATUS.RELEASED:
        return <Tag color="success">{movie?.status}</Tag>;

      default:
        return movie?.status;
    }
  };

  const CreditDetails = () => {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text) => text || '-',
      },
      {
        title: 'Character',
        dataIndex: 'character',
        key: 'character',
        render: (text) => text || '-',
      },
      {
        title: 'Gender',
        dataIndex: 'characterGender',
        key: 'characterGender',
        render: (text) => text || '-',
      },
      {
        title: 'Department',
        dataIndex: 'department',
        key: 'department',
        render: (text) => text || '-',
      },

      {
        title: 'Type',
        dataIndex: 'creditType',
        key: 'creditType',
        render: (text) => text || '-',
      },
    ];
    return (
      <Table
        columns={columns}
        dataSource={movie?.castAndCrew}
        showHeader
        title={() => (
          <>
            <Title level={3}>Cast & Crew</Title>
            <Divider />
          </>
        )}
      />
    );
  };

  if (loading) {
    return <LoaderComponent />;
  }

  const movieDetailContent = (
    <>
      <div>
        <Space
          direction="horizontal"
          align="center"
          split={<Divider type="vertical" />}
        >
          <Typography.Text className="movie-detail-description">
            <CalendarOutlined className="mr-8" />
            {dayjs(movie?.releaseDate).format(defaultDateFormat)}
          </Typography.Text>
          <Typography.Text className="movie-detail-description">
            <ClockCircleOutlined className="mr-8" />
            {getTimeFromMins(movie?.runtime)}
          </Typography.Text>
          <Typography.Text className="movie-detail-description">
            {map(movie?.genres, (genre) => (
              <Tag key={genre?.id}>{genre?.name} </Tag>
            ))}
          </Typography.Text>
        </Space>
      </div>
      <Descriptions className="mt-16">
        <Descriptions.Item label="Overview">
          {movie?.overview}
        </Descriptions.Item>
        <Descriptions.Item label="Status">{handleStatus}</Descriptions.Item>
        <Descriptions.Item label="Original Language">
          {movie?.originalLanguage}
        </Descriptions.Item>
        <Descriptions.Item label="Budget">${movie?.budget}</Descriptions.Item>
        <Descriptions.Item label="Revenue">${movie?.revenue}</Descriptions.Item>
      </Descriptions>
    </>
  );
  const Content = ({ children, extraContent }) => (
    <Row className="movie-content">
      <div className="flex-1">{children}</div>
      <div className="image">{extraContent}</div>
    </Row>
  );
  return (
    <Card
      title={
        <>
          <Button
            type="text"
            shape="circle"
            onClick={handleBack}
            icon={<ArrowLeftOutlined />}
          />
          {movie?.title}
          <Text type="secondary" className="ml-8">
            {movie?.tagline}
          </Text>
        </>
      }
    >
      <Content
        extraContent={<img src={imagePlaceholder} alt="content" width="100%" />}
      >
        {movieDetailContent}
      </Content>
      <CreditDetails />
    </Card>
  );
}

export default MovieDetail;
