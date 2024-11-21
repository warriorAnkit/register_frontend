import { LockOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { Button, Card, Form, Input, Spin } from 'antd';
import React, { useEffect } from 'react';
import { Logo } from '../../assets/svg';
import { ROUTES } from '../../common/constants';
import { formValidatorRules } from '../../common/utils';
import useRouter from '../../hooks/useRouter';
import { RESET_PASSWORD, VERIFY_TOKEN } from './graphql/Mutations';

const { required } = formValidatorRules;

const ChangePassword = () => {
  const {
    navigate,
    location: { pathname, search },
  } = useRouter();
  const [resetPassword, { loading: reseting }] = useMutation(RESET_PASSWORD);
  const [verifyToken] = useMutation(VERIFY_TOKEN);
  const params = new URLSearchParams(search);
  const token = params?.get('token');

  useEffect(() => {
    if (pathname === ROUTES?.RESET) {
      verifyToken({
        variables: {
          token,
        },
      }).catch((e) => e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, pathname]);

  const onFinish = async ({ password }) => {
    try {
      const response = await resetPassword({
        variables: { data: { token, newPassword: password?.trim() } },
      });
      if (response) {
        navigate(ROUTES?.LOGIN, { replace: true });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console?.error('error from login => ', error);
    }
  };

  return (
    <div className="login-wrap d-flex align-center justify-center">
      <Card className="full-width">
        <div className="text-center">
          <Logo />
          <h2 className="text-center">Reset Password</h2>
          <p className="text-center">Enter a new password for your account</p>
        </div>
        <Spin spinning={reseting}>
          <Form
            name="reset-password"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
          >
            <Form.Item
              name="password"
              rules={[{ required, message: 'Please enter password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter password"
              />
            </Form.Item>
            <Form.Item
              name="retype-password"
              rules={[
                { required, message: 'Please enter confirm password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value !== getFieldValue('password')) {
                      return Promise?.reject(
                        new Error('Passwords do not match'),
                      );
                    }
                    return Promise?.resolve();
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter confirm password"
              />
            </Form.Item>
            <Form.Item className="full-width mb-8">
              <Button type="primary" className="full-width" htmlType="submit">
                Reset Password
              </Button>
            </Form.Item>
            <Form.Item className="text-center mb-0">
              <Button
                type="link"
                onClick={() => {
                  navigate(ROUTES?.LOGIN);
                }}
              >
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default ChangePassword;
