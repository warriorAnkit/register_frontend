import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useLazyQuery } from '@apollo/client';
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Steps,
  Tag,
  Upload,
} from 'antd';
import dayjs from 'dayjs';
import {
  capitalize,
  debounce,
  hasIn,
  isEmpty,
  map,
  omit,
  parseInt,
  replace,
  trim,
  uniqBy,
} from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { LIMIT, ROUTES, defaultDateFormat } from '../../common/constants';
import {
  fileUpload,
  formValidatorRules,
  handleProtectedNavigation,
} from '../../common/utils';
import TableComponent from '../../components/CommonTable';
import LoaderComponent from '../../components/LoaderComponent';
import RouterPrompt from '../../components/RouterPrompt';
import useRouter from '../../hooks/useRouter';
import AddCreditModal from './components/AddCreditModal';
import {
  COUNTRIES,
  GET_MOVIES_SIGNED_URL,
  LANGUAGES,
  LIST_GENRES,
  LIST_MOVIE_CREDITS,
} from './graphql/Queries';

const { required } = formValidatorRules;

let countryDebounce = null;
let originalLanguageDebounce = null;
let languageIdDebounce = null;
const initialCountryFilter = {
  filter: {
    skip: 0,
    limit: LIMIT,
  },
};
const initialOriginalLngFilter = {
  filter: {
    skip: 0,
    limit: LIMIT,
  },
};

const initialPaginationValue = {
  total: 0,
  current: 1,
};

function MoviesForm({
  mutation,
  movieData,
  edit = false,
  dataLoading,
  setMovieLoading,
}) {
  const { navigate } = useRouter();
  const [form] = Form?.useForm();
  const [detailForm] = Form?.useForm();
  const [creditsForm] = Form?.useForm();
  const [isCountryEnd, setIsCountryEnd] = useState(false);
  const [isLngEnd, setIsLngEnd] = useState(false);
  const [isOriginalLngEnd, setIsOriginalLngEnd] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [fileList, setFileList] = useState([]);
  const [current, setCurrent] = useState(0);
  const [paginationProp, setPaginationProp] = useState(initialPaginationValue);
  const [formValues, setFormValues] = useState(
    movieData
      ? {
          ...movieData,
          releaseDate: movieData?.releaseDate
            ? dayjs(movieData?.releaseDate)
            : null,
          genres: map(movieData?.genres, (item) => ({
            value: item?.id,
            label: item?.name,
          })),
          countryIds: movieData?.countries?.map((country) => ({
            label: country?.englishName,
            value: country?.id,
          })),
          languageIds: movieData?.languages?.map((language) => ({
            label: language?.englishName,
            value: language?.id,
          })),
        }
      : {},
  );
  const [showModal, setShowModal] = useState(false);
  const [creditsData, setCreditsData] = useState([]);
  const [genreList, setGenreList] = useState([]);
  const [listGenre] = useLazyQuery(LIST_GENRES, {
    fetchPolicy: 'network-only',
    onCompleted(res) {
      setGenreList(res?.listGenre);
    },
    onError() {},
  });
  const [fetchCountries, { data: countryData }] = useLazyQuery(COUNTRIES, {
    fetchPolicy: 'network-only',
    onError() {},
  });
  const [fetchLanguages, { data: languageData }] = useLazyQuery(LANGUAGES, {
    fetchPolicy: 'network-only',
    onError() {},
  });

  const [fetchSignedUrl] = useLazyQuery(GET_MOVIES_SIGNED_URL, {
    fetchPolicy: 'network-only',
    onError() {},
  });

  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState([]);
  const [value, setValue] = useState([]);
  const [languageValue, setLanguageValue] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [originalLanguageOptions, setOriginalLanguageOptions] = useState([]);
  const [isLanguageIds, setIsLanguageIds] = useState(false);
  const [isOriginalLanguage, setIsOriginalLanguage] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPrompt, setIsPrompt] = useState(false);
  const [fetchCredits] = useLazyQuery(LIST_MOVIE_CREDITS, {
    fetchPolicy: 'network-only',
    onCompleted(res) {
      setCreditsData(res?.listMovieCredits?.data);
      const pagination = {
        ...paginationProp,
        total: res?.listMovieCredits?.count,
      };
      setPaginationProp(pagination);
    },
    onError() {},
  });

  const handleUploadImage = async (info) => {
    const imageName = info?.file?.name;
    const fileName = replace(imageName, new RegExp(' ', 'g'), '_');
    try {
      return fetchSignedUrl({
        variables: {
          data: {
            fileName,
            movieId: movieData?.id,
          },
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error while uploading image', error);
    }
  };

  const handleOk = () => {
    handleProtectedNavigation(true, navigate, -1);
  };

  const handleClose = () => {
    setIsPrompt(false);
  };

  const onFinish = async (name, { values }) => {
    if (name === 'detailsForm') {
      const updatedValues = {
        ...values,
        countryIds: map(values?.countryIds, (item) => item?.value),
        languageIds: map(values?.languageIds, (item) => item?.value),
        originalLanguage: values?.originalLanguage?.trim(),
        originalTitle: values?.originalTitle?.trim(),
        overview: values?.overview?.trim(),
        tagline: values?.tagline?.trim(),
        title: values?.title?.trim(),
        genres: selectedGenre,
        releaseDate: values?.releaseDate ? dayjs(values?.releaseDate) : null,
        adult: values?.adult || false,
        budget: parseInt(values?.budget, 10),
        revenue: parseInt(values?.revenue, 10),
        runtime: parseInt(values?.runtime, 10),
      };
      setFormValues(updatedValues);
      setCurrent(current + 1);
    }
    if (name === 'creditsForm') {
      setLoading(true);
      setShowPrompt(false);
      let newCredits = [];
      if (creditsData) {
        newCredits = map(creditsData, (credit) => {
          if (hasIn(credit?.person, 'id') && hasIn(credit?.person, 'name')) {
            return omit(
              {
                ...credit,
                person: {
                  id: credit?.person?.id,
                },
              },
              '__typename',
              'id',
            );
          }
          return omit(
            {
              ...credit,
              person: {
                name: credit?.person?.name,
              },
            },
            '__typename',
            'id',
          );
        });
      }
      try {
        const dataToSend = {
          ...formValues,
          credits: newCredits,
        };

        if (formValues?.imageUrl) {
          if (formValues?.imageUrl?.fileList?.length > 0) {
            await handleUploadImage(formValues?.imageUrl).then(async (res) => {
              const signedImageUrl =
                res?.data?.getMoviesSignedPutUrl?.signedUrl;
              const key = res?.data?.getMoviesSignedPutUrl?.key;
              await fileUpload(signedImageUrl, formValues?.imageUrl?.file);
              dataToSend.imageUrl = key;
            });
          } else if (formValues?.imageUrl?.file?.status === 'removed') {
            dataToSend.imageUrl = null;
          } else {
            delete dataToSend.imageUrl;
          }
        }
        if (edit) {
          const response = await mutation({
            variables: {
              id: movieData?.id,
              data: dataToSend,
            },
          });
          setLoading(false);
          if (response?.data?.updateMovie) {
            form?.resetFields();
            navigate(ROUTES?.MOVIES);
          }
        } else {
          const response = await mutation({
            variables: {
              data: dataToSend,
            },
          });
          setLoading(false);
          if (response?.data?.createMovie) {
            form?.resetFields();
            navigate(ROUTES?.MOVIES);
          }
        }
      } catch (error) {
        setLoading(false);
      }
    }
  };
  useEffect(() => {
    if (movieData?.genres) {
      const oldGenres = [];
      movieData?.genres?.forEach((genre) => oldGenres.push({ id: genre?.id }));
      setSelectedGenre(oldGenres);
    }
  }, [movieData]);

  useEffect(() => {
    listGenre();
    fetchCountries({
      variables: initialCountryFilter,
      fetchPolicy: 'network-only',
    });
    fetchLanguages({
      variables: initialOriginalLngFilter,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (countryData?.countries?.data) {
      const countryArray = [];
      countryData?.countries?.data?.forEach((element) => {
        countryArray?.push({
          label: element?.englishName,
          value: element?.id,
        });
      });
      if (countryData?.countries?.data?.length < LIMIT) {
        setIsCountryEnd(true);
      }
      if (countrySearch) {
        setCountryOptions(uniqBy(countryArray, 'value'));
      } else {
        setCountryOptions(
          uniqBy([...countryOptions, ...countryArray], 'value'),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryData]);

  useEffect(() => {
    if (languageData?.languages?.data) {
      const languageArray = [];
      const originalLanguageArray = [];
      languageData?.languages?.data?.forEach((element) => {
        languageArray?.push({
          label: element?.englishName,
          value: element?.id,
        });
        originalLanguageArray?.push({
          label: element?.englishName,
          value: element?.englishName,
        });
      });
      if (isLanguageIds) {
        if (languageSearch) {
          setLanguageOptions(uniqBy([...languageArray], 'value'));
        } else {
          setLanguageOptions(
            uniqBy([...languageOptions, ...languageArray], 'value'),
          );
        }
        if (languageData?.languages?.data?.length < LIMIT) {
          setIsLngEnd(true);
        }
      } else if (isOriginalLanguage) {
        if (languageSearch) {
          setOriginalLanguageOptions(
            uniqBy([...originalLanguageArray], 'value'),
          );
        } else {
          setOriginalLanguageOptions(
            uniqBy(
              [...originalLanguageOptions, ...originalLanguageArray],
              'value',
            ),
          );
        }
        if (languageData?.languages?.data?.length < LIMIT) {
          setIsOriginalLngEnd(true);
        }
      } else {
        setLanguageOptions(
          uniqBy([...languageOptions, ...languageArray]),
          'value',
        );
        setOriginalLanguageOptions(
          uniqBy(
            [...originalLanguageOptions, ...originalLanguageArray],
            'value',
          ),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageData]);

  useEffect(() => {
    if (movieData) {
      fetchCredits({
        variables: {
          id: movieData?.id,
          filter: {
            skip: 0,
            limit: 10,
          },
        },
      });
      if (movieData?.imageUrl) {
        setFileList([{ url: movieData?.imageUrl }]);
      }
      setFormValues({
        ...movieData,
        releaseDate: movieData?.releaseDate
          ? dayjs(movieData?.releaseDate)
          : null,
        genres: map(movieData?.genres, (item) => ({
          value: item?.id,
          label: item?.name,
        })),
        countryIds: movieData?.countries?.map((country) => ({
          label: country?.englishName,
          value: country?.id,
        })),
        languageIds: movieData?.languages?.map((language) => ({
          label: language?.englishName,
          value: language?.id,
        })),
      });
      setMovieLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieData]);

  const handleBack = () => {
    setIsPrompt(!handleProtectedNavigation(!showPrompt, navigate, -1));
  };

  const handleShowPrompt = () => {
    setShowPrompt(true);
  };

  const disabledStartDate = (startValue) =>
    startValue?.valueOf() < dayjs()?.valueOf();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function fetchCountry(searchTerm) {
    setCountrySearch(searchTerm);
    if (searchTerm) {
      fetchCountries({
        variables: {
          ...initialCountryFilter,
          filter: {
            searchTerm: trim(searchTerm),
          },
        },
      });
    }
  }

  const debounceFetcher = useMemo(() => {
    const loadOptions = (val) => {
      fetchCountry(val);
    };
    return debounce(loadOptions, 800);
  }, [fetchCountry]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function fetchLanguage(searchTerm) {
    setLanguageSearch(searchTerm);
    if (searchTerm) {
      fetchLanguages({
        variables: {
          ...initialOriginalLngFilter,
          filter: {
            searchTerm: trim(searchTerm),
          },
        },
      });
    }
  }

  const debounceLanguageFetcher = useMemo(() => {
    const loadOptions = (val) => {
      fetchLanguage(val);
    };
    return debounce(loadOptions, 800);
  }, [fetchLanguage]);

  const onCountryScroll = (event) => {
    if (countryDebounce) {
      countryDebounce?.cancel();
    }
    countryDebounce = debounce(() => {
      const { target } = event;
      const { scrollTop, scrollHeight, offsetHeight } = target || {};
      const scrolledToBottom = scrollTop + offsetHeight >= scrollHeight - 5;
      if (scrolledToBottom && !isCountryEnd) {
        fetchCountries({
          variables: {
            ...initialCountryFilter,
            filter: {
              ...initialCountryFilter?.filter,
              skip: countryOptions?.length,
            },
          },
        });
      }
    }, 500);
    countryDebounce();
  };
  const handleLanguageScroll = (event) => {
    if (originalLanguageDebounce) {
      originalLanguageDebounce?.cancel();
    }
    originalLanguageDebounce = debounce(() => {
      const { target } = event;
      const { scrollTop, scrollHeight, offsetHeight } = target || {};
      const scrolledToBottom = scrollTop + offsetHeight >= scrollHeight - 5;
      if (scrolledToBottom && !isOriginalLngEnd) {
        fetchLanguages({
          variables: {
            ...initialOriginalLngFilter,
            filter: {
              ...initialOriginalLngFilter?.filter,
              skip: originalLanguageOptions?.length,
            },
          },
        });
      }
    }, 500);
    originalLanguageDebounce();
  };
  const handleLanguageIdScroll = (event) => {
    if (languageIdDebounce) {
      languageIdDebounce?.cancel();
    }
    languageIdDebounce = debounce(() => {
      const { target } = event;
      const { scrollTop, scrollHeight, offsetHeight } = target || {};
      const scrolledToBottom = scrollTop + offsetHeight >= scrollHeight - 5;
      if (scrolledToBottom && !isLngEnd) {
        fetchLanguages({
          variables: {
            ...initialOriginalLngFilter,
            filter: {
              ...initialOriginalLngFilter?.filter,
              skip: languageOptions?.length,
            },
          },
        });
      }
    }, 500);
    languageIdDebounce();
  };

  const handleResetCountryData = () => {
    setIsCountryEnd(false);
    setCountrySearch('');
    setCountryOptions([]);
    fetchCountries({ variables: initialCountryFilter });
  };
  const handleResetLanguageData = (isLanguageId) => {
    setIsLngEnd(false);
    setLanguageSearch('');
    if (isLanguageId) {
      setLanguageOptions([]);
    } else {
      setOriginalLanguageOptions([]);
    }
    fetchLanguages({
      variables: initialOriginalLngFilter,
    });
  };

  const handleCancel = () => {
    creditsForm?.resetFields();
    setTimeout(() => {
      creditsForm?.setFieldsValue({
        credits: [{}],
      });
    }, 500);
    setEditData(null);
    setShowModal(false);
  };

  const handleDelete = (key) =>
    new Promise((resolve) => {
      const newData = creditsData?.filter((item) => item?.id !== key);
      setCreditsData(newData);
      setTimeout(() => {
        resolve();
      }, 3000);
    });

  const columns = [
    {
      title: 'Type',
      key: 'creditType',
      dataIndex: 'creditType',
      render: (type) => capitalize(type),
    },
    {
      title: 'Department',
      key: 'department',
      dataIndex: 'department',
      render: (department) => department || '-',
    },
    { title: 'Job', key: 'job', dataIndex: 'job', render: (job) => job || '-' },
    {
      title: 'Character',
      key: 'character',
      dataIndex: 'character',
      render: (character) => character || '-',
    },
    {
      title: 'Adult',
      key: 'adult',
      dataIndex: 'characterAdult',
      render: (adult) => {
        if (adult === true) return 'Yes';
        if (adult === false) return 'No';
        return '-';
      },
    },
    {
      title: 'Gender',
      key: 'gender',
      dataIndex: 'characterGender',
      align: 'center',
      render: (gender) => {
        if (gender === 'MALE') {
          return <Tag color="blue"> Male</Tag>;
        }
        if (gender === 'FEMALE') {
          return <Tag color="magenta">Female</Tag>;
        }
        if (gender === 'OTHER') {
          return <Tag color="green"> Other</Tag>;
        }
        return '-';
      },
    },
    {
      title: 'Person Name',
      key: 'personName',
      dataIndex: 'person',
      render: (person) => person?.name || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (action, record) => (
        <div className="d-flex">
          <EditOutlined
            className="mr-8"
            onClick={() => {
              setEditData(record);
              setShowModal(true);
            }}
          />
          <Popconfirm
            title="Delete credit"
            description="Are you sure to delete this credit?"
            onConfirm={() => handleDelete(record?.id)}
            okText="Delete"
          >
            <DeleteOutlined className="delete-icon" />
          </Popconfirm>
        </div>
      ),
    },
  ];
  if (dataLoading) return <LoaderComponent />;
  return (
    <>
      <Form.Provider
        onFormFinish={onFinish}
        className="full-height sticky-action-form"
        form={form}
        layout="vertical"
      >
        <AddCreditModal
          showModal={showModal}
          onCancel={handleCancel}
          creditsForm={creditsForm}
          setCreditsData={setCreditsData}
          setShowModal={setShowModal}
          creditsData={creditsData}
          handleShowPrompt={handleShowPrompt}
          editData={editData}
          setEditData={setEditData}
        />
        <div className="title">
          <Button
            type="text"
            shape="circle"
            onClick={handleBack}
            icon={<ArrowLeftOutlined />}
          />
          {edit ? 'Edit Movie' : 'Add Movie'}
        </div>
        <Card
          className="ant-body-scroll"
          title={
            <Steps
              current={current}
              className="steps"
              items={[{ title: 'Details' }, { title: 'Credits' }]}
            />
          }
          actions={[
            <div key="actionbutton" className="text-right">
              <Space>
                <Button onClick={handleBack} disabled={loading}>
                  Cancel
                </Button>
                {current !== 0 && (
                  <Button
                    disabled={loading}
                    onClick={() => {
                      setCurrent(0);
                    }}
                  >
                    Previous
                  </Button>
                )}
                <Button
                  type="primary"
                  onClick={() => {
                    if (current === 0) {
                      detailForm?.submit();
                    } else {
                      creditsForm?.submit();
                    }
                  }}
                  loading={loading}
                >
                  {current === 0 ? 'Next' : 'Submit'}
                </Button>
              </Space>
            </div>,
          ]}
        >
          <div className="card-body-wrapper">
            {current === 0 ? (
              <Form
                name="detailsForm"
                form={detailForm}
                initialValues={formValues}
                onValuesChange={handleShowPrompt}
              >
                <Form.Item name="imageUrl">
                  <Upload
                    accept="image/x-png, image/jpeg, image/jpg"
                    beforeUpload={() => false}
                    className="upload-image-container"
                    listType="picture-card"
                    showUploadList={{
                      showPreviewIcon: false,
                      showRemoveIcon: true,
                    }}
                    onChange={(info) => {
                      setFileList(info?.fileList);
                    }}
                    fileList={fileList}
                    maxCount={1}
                  >
                    {fileList?.length === 0 && (
                      <div className="d-flex align-center justify-center flex-vertical upload-content">
                        <PlusOutlined />
                        <p>Upload Image</p>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12} xl={8}>
                    <Form.Item
                      name="originalTitle"
                      label="Original Title"
                      rules={[
                        { required, message: 'Please enter original title!' },
                      ]}
                    >
                      <Input placeholder="Enter original title" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12} xl={8}>
                    <Form.Item
                      name="title"
                      label="Title"
                      rules={[{ required, message: 'Please enter title!' }]}
                    >
                      <Input placeholder="Enter title" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12} xl={8}>
                    <Form.Item
                      name="originalLanguage"
                      label="Original Language"
                      rules={[
                        {
                          required,
                          message: 'Please enter original language!',
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        placeholder="Select language"
                        optionFilterProp="children"
                        onBlur={() => {
                          setIsOriginalLanguage(true);
                          setIsLanguageIds(false);
                          handleResetLanguageData(false);
                        }}
                        allowClear
                        onClear={() => {
                          setIsOriginalLanguage(true);
                          setIsLanguageIds(false);
                          handleResetLanguageData(false);
                        }}
                        onInputKeyDown={() => {
                          setIsOriginalLanguage(true);
                          setIsLanguageIds(false);
                        }}
                        onPopupScroll={(event) => {
                          setIsOriginalLanguage(true);
                          setIsLanguageIds(false);
                          handleLanguageScroll(event);
                        }}
                        onSearch={debounceLanguageFetcher}
                        filterOption={(input, option) =>
                          (option?.label ?? '')
                            ?.toLowerCase()
                            ?.includes(input?.toLowerCase())
                        }
                        options={originalLanguageOptions}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12} xl={8} id="language-list">
                    <Form.Item name="languageIds" label="Language Ids">
                      <Select
                        labelInValue
                        mode="multiple"
                        filterOption={false}
                        value={languageValue}
                        placeholder="Select language"
                        onSearch={debounceLanguageFetcher}
                        onBlur={() => {
                          setIsLanguageIds(true);
                          setIsOriginalLanguage(false);
                          handleResetLanguageData(true);
                        }}
                        allowClear
                        onClear={() => {
                          setIsLanguageIds(true);
                          setIsOriginalLanguage(false);
                          handleResetLanguageData(true);
                        }}
                        onPopupScroll={(event) => {
                          setIsLanguageIds(true);
                          setIsOriginalLanguage(false);
                          handleLanguageIdScroll(event);
                        }}
                        onInputKeyDown={() => {
                          setIsLanguageIds(true);
                          setIsOriginalLanguage(false);
                        }}
                        onChange={(e) => {
                          setLanguageValue(e);
                        }}
                        options={languageOptions}
                        getPopupContainer={() =>
                          // eslint-disable-next-line no-undef
                          document?.getElementById('language-list')
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12} xl={8}>
                    <Form.Item name="countryIds" label="Country">
                      <Select
                        labelInValue
                        mode="multiple"
                        filterOption={false}
                        value={value}
                        placeholder="Select country"
                        onSearch={debounceFetcher}
                        onBlur={handleResetCountryData}
                        onClear={handleResetCountryData}
                        onPopupScroll={onCountryScroll}
                        onChange={(e) => {
                          setValue(e);
                        }}
                        options={countryOptions}
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12} xl={8}>
                    <Form.Item
                      name="releaseDate"
                      label="Release date"
                      rules={[
                        { required, message: 'Please select release date!' },
                      ]}
                    >
                      <DatePicker
                        className="full-width"
                        disabledDate={disabledStartDate}
                        format={defaultDateFormat}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12} xl={8}>
                    <Form.Item
                      name="tagline"
                      label="Tagline"
                      rules={[{ required, message: 'Please enter tagline!' }]}
                    >
                      <Input placeholder="Enter tagline" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12} xl={8}>
                    <Form.Item
                      name="status"
                      label="Status"
                      rules={[{ required, message: 'Please select status!' }]}
                    >
                      <Select placeholder="Select status">
                        <Select.Option value="Released">Released</Select.Option>
                        <Select.Option value="Pending">Pending</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12} xl={8} id="genre-list">
                    <Form.Item name="genres" label="Genres">
                      <Select
                        mode="tags"
                        placeholder="Select Genre"
                        filterOption={(input, option) =>
                          (option?.children ?? '')
                            ?.toLowerCase()
                            ?.includes(input?.toLowerCase())
                        }
                        getPopupContainer={() =>
                          // eslint-disable-next-line no-undef
                          document?.getElementById('genre-list')
                        }
                        onChange={(values, options) => {
                          map(options, (item, index) => {
                            if (isEmpty(item)) {
                              setSelectedGenre([
                                { name: values?.[index] },
                                ...selectedGenre,
                              ]);
                            } else {
                              setSelectedGenre([
                                { id: item?.key },
                                ...selectedGenre,
                              ]);
                            }
                          });
                        }}
                      >
                        {map(genreList, (genre) => (
                          <Select.Option key={genre?.id} value={genre?.id}>
                            {genre?.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12} xl={8}>
                    <Form.Item
                      name="budget"
                      label="Budget"
                      rules={[{ required, message: 'Please enter budget!' }]}
                    >
                      <Input
                        type="number"
                        min={1}
                        placeholder="Enter budget"
                        className="full-width"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12} xl={8}>
                    <Form.Item
                      name="revenue"
                      label="Revenue"
                      rules={[{ required, message: 'Please enter revenue!' }]}
                    >
                      <Input
                        type="number"
                        min={1}
                        placeholder="Enter revenue"
                        className="full-width"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12} xl={8}>
                    <Form.Item
                      name="runtime"
                      label="Runtime(Min)"
                      rules={[{ required, message: 'Please enter runtime!' }]}
                    >
                      <Input
                        type="number"
                        min={1}
                        placeholder="Enter runtime(min)"
                        className="full-width"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={24} xl={24}>
                    <Form.Item
                      name="overview"
                      label="Overview"
                      rules={[{ required, message: 'Please enter overview!' }]}
                    >
                      <Input.TextArea placeholder="Enter overview" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12} xl={8}>
                    <Form.Item
                      name="adult"
                      label="Rated"
                      valuePropName="checked"
                    >
                      <Checkbox>Adult</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            ) : (
              <div>
                {creditsData?.length > 0 ? (
                  <div>
                    <div className="text-end">
                      <Button
                        type="primary"
                        onClick={() => {
                          setShowModal(true);
                        }}
                        className="mb-16"
                      >
                        Add Credits
                      </Button>
                    </div>
                    <div>
                      <TableComponent
                        tableClassName={`movie-table ${
                          creditsData?.length > 6 ? 'setheight' : ''
                        }`}
                        columns={columns}
                        data={creditsData || []}
                        rowKey={(obj) => obj?.id}
                        paginationConfig={paginationProp}
                        scroll={{
                          y: 'max-content',
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="add-credit-btn">
                    <Empty description={false} />
                    <Button
                      type="primary"
                      onClick={() => {
                        setShowModal(true);
                      }}
                    >
                      Add Credits
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </Form.Provider>
      <RouterPrompt
        isPrompt={isPrompt}
        handleOK={handleOk}
        handleCancel={handleClose}
      />
    </>
  );
}

export default MoviesForm;
