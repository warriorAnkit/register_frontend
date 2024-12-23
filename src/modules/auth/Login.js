/* eslint-disable no-console */
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { Button, Card, Form, Input, Space, Spin } from 'antd';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../AppContext';
import { Logo } from '../../assets/svg/index';
import { ROUTES } from '../../common/constants';
import { formValidatorRules } from '../../common/utils';
import useRouter from '../../hooks/useRouter';
import './auth.less';
import { LOGIN } from './graphql/Mutations';

const { required, email } = formValidatorRules;
const logLocalStorage = () => {
  console.log("Local Storage Contents:");
  // eslint-disable-next-line no-undef, no-plusplus
  for (let i = 0; i < localStorage.length; i++) {
    // eslint-disable-next-line no-undef
    const key = localStorage.key(i);
    // eslint-disable-next-line no-undef
    const value = localStorage.getItem(key);
    console.log(`${key}: ${value}`);
  }
};

// Call the function to log local storage contents


const Login = () => {
  const [form] = Form.useForm();
  const { navigate } = useRouter();
  const { initializeAuth } = useContext(AppContext);
  const [loginMutate, { loading: loginLoading }] = useMutation(LOGIN, {
    onError(error) {
      // eslint-disable-next-line no-console
      console.error('Login error:', error); // Log or handle error as needed
    },
  });
  function successCallback(accessToken, userData, refreshToken) {
    initializeAuth(accessToken, userData, refreshToken);
    navigate('/');
  }

  const onFinish = async (values) => {
    try {
      const formValues = {
        email: values?.email?.trim().toLowerCase(),
        password: values?.password?.trim(),
      };



      const response = await loginMutate({
        variables: { email: formValues.email, password: formValues.password },
      });
      // eslint-disable-next-line no-console
      console.log("hiii",response.data.loginUser);

      // eslint-disable-next-line no-console
      console.log("hrr",response);
      if (response?.data) {
        const accessToken = response?.data?.loginUser?.accessToken;
        const userData = response?.data?.loginUser?.data;
        const tokenRefresh =
          response?.data?.loginUser?.refreshToken;

          // eslint-disable-next-line no-console

        if (successCallback) {
          successCallback(accessToken, userData, tokenRefresh);
          logLocalStorage();

        }
      } else {
        form?.setFieldsValue(values);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console?.error('error from login => ', error);
    }
  };

  return (
    <div className="auth-bg">
      <div className="login-wrap d-flex align-center justify-start">
        <Card className="full-width">
          <Spin spinning={loginLoading} wrapperClassName="full-width">
            <div className="text-center  mb-30">
            <Logo style={{  maxHeight: '80px' }} />
            </div>
            <Form
              name="Login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              size="large"
              form={form}
            >
              <Form.Item
                name="email"
                rules={[{ required, message: 'Please enter email!' }, email]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter email" />
              </Form.Item>

              <Form.Item
                name="password"
                className="mb-8"
                rules={[{ required, message: 'Please enter password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter password"
                />
              </Form.Item>
              {/* <Form.Item className="text-right mb-8">
                <Link to={ROUTES?.FORGET_PASSWORD}>Forgot password ?</Link>
              </Form.Item> */}
              <Form.Item className=" full-width mb-8">
                <Button type="primary" className="full-width" htmlType="submit"
                 style={{ backgroundColor: '#ff784f', borderColor: '#FC5027' }}>
                  Login
                </Button>
              </Form.Item>
              {/* <Form.Item className="text-center mb-0">
                <Space>
                  Don't have an account yet ?
                  <Button
                    type="link"
                    className="p-0"
                    onClick={() => {
                      navigate(ROUTES?.SIGNUP);
                    }}
                  >
                    Signup
                  </Button>
                </Space>
              </Form.Item> */}
            </Form>
          </Spin>
        </Card>
        <div className="text-center login-copyrights">
          Logicwind © {new Date()?.getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default Login;
