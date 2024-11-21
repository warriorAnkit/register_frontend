import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Card, Col, Form, Input, Row, Space, Upload } from 'antd';
import React, { useContext, useState } from 'react';
import { AppContext } from '../../AppContext';
import {
  beforeUpload,
  formValidatorRules,
  getBase64File,
  handleProtectedNavigation,
} from '../../common/utils';
import RouterPrompt from '../../components/RouterPrompt';
import useRouter from '../../hooks/useRouter';
import { UPDATE_CURRENT_USER } from '../auth/graphql/Mutations';
import { GET_CURRENT_USER } from '../auth/graphql/Queries';

const { required, name, email } = formValidatorRules;

function Profile() {
  const { dispatch, initializeAuth, getToken } = useContext(AppContext);

  const [btnLoading, setBtnLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();

  const [form] = Form?.useForm();
  const { navigate } = useRouter();
  const idToken = getToken();
  const { data: userData } = useQuery(GET_CURRENT_USER);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPrompt, setIsPrompt] = useState(false);

  const [updateCurrentUser] = useMutation(UPDATE_CURRENT_USER, {
    onCompleted: (res) => {
      dispatch({
        type: 'SET_CURRENT_USER',
        data: res?.updateCurrentUser?.data,
      });
      initializeAuth(idToken, res?.updateCurrentUser?.data);
    },
    onError: () => {
      form?.setFieldsValue(userData);
      setBtnLoading(false);
    },
  });

  const handleChange = (info) => {
    if (info?.file?.status === 'uploading') {
      setBtnLoading(true);
      return;
    }
    if (info?.file?.status === 'done') {
      // Get this url from response in real world.
      getBase64File(info?.file?.originFileObj, (url) => {
        setBtnLoading(false);
        setImageUrl(url);
      });
    }
  };

  const uploadButton = (
    <div>
      {btnLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div className="mt-8">Upload</div>
    </div>
  );

  const handleBack = () => {
    setIsPrompt(!handleProtectedNavigation(!showPrompt, navigate, -1));
  };

  const handleShowPrompt = () => {
    setShowPrompt(true);
  };

  const handleOk = () => {
    handleProtectedNavigation(true, navigate, -1);
  };

  const handleClose = () => {
    setIsPrompt(false);
  };

  const onFinish = async (values) => {
    setBtnLoading(true);
    setShowPrompt(false);
    const userObj = {
      firstName: values?.firstName?.trim(),
      lastName: values?.lastName?.trim(),
      // It is set as disabled as decided
      // email: values?.email?.trim()
      // commented as of now.
      // profileImage: values?.profileImage
    };
    await updateCurrentUser({
      variables: {
        data: userObj,
      },
    });
    setBtnLoading(false);
  };
  return (
    <>
      {userData?.getCurrentUser && (
        <Form
          form={form}
          className="sticky-action-form"
          onFieldsChange={handleShowPrompt}
          layout="vertical"
          initialValues={userData?.getCurrentUser}
          onFinish={onFinish}
        >
          <Card
            className="ant-body-scroll"
            title="Profile"
            actions={[
              <div key="actionbutton" className="text-right">
                <Space>
                  <Button onClick={handleBack} disabled={btnLoading}>
                    Cancel
                  </Button>
                  <Button type="primary" loading={btnLoading} htmlType="submit">
                    Save
                  </Button>
                </Space>
              </div>,
            ]}
          >
            <div className="card-body-wrapper">
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={24} xl={24}>
                  <Form.Item name="profileImage" label="Profile photo">
                    <Upload
                      name="avatar"
                      listType="picture-card"
                      className="avatar-uploader"
                      showUploadList={false}
                      beforeUpload={beforeUpload}
                      onChange={handleChange}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="avatar"
                          className="full-width"
                        />
                      ) : (
                        uploadButton
                      )}
                    </Upload>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8} xl={8}>
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[
                      { ...required, message: 'Please Enter First Name' },
                      name,
                    ]}
                  >
                    <Input placeholder="Enter First Name" />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8} xl={8}>
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[
                      { ...required, message: 'Please Enter Last Name' },
                      name,
                    ]}
                  >
                    <Input placeholder="Enter Last Name" />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={8} xl={8}>
                  <Form.Item
                    name="email"
                    label="Email Id"
                    rules={[
                      { ...required, message: 'Please Enter Email' },
                      email,
                    ]}
                  >
                    <Input disabled placeholder="Enter Email Id" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Card>
        </Form>
      )}
      <RouterPrompt
        isPrompt={isPrompt}
        handleOK={handleOk}
        handleCancel={handleClose}
      />
    </>
  );
}
export default Profile;
