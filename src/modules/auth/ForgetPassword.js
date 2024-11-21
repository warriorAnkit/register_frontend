import { UserOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { Button, Card, Form, Input, Spin } from 'antd';
import React from 'react';
import { Logo } from '../../assets/svg';
import { ROUTES } from '../../common/constants';
import { formValidatorRules } from '../../common/utils';
import useRouter from '../../hooks/useRouter';
import { FORGOT_PASSWORD } from './graphql/Mutations';

const { required, email } = formValidatorRules;

const ForgetPassword = () => {
  const { navigate } = useRouter();
  const [forgetPasswordMutating, { loading }] = useMutation(FORGOT_PASSWORD, {
    onError() {}, // Always write this method for error handling in all mutation.
  });

  const onFinish = async (values) => {
    try {
      const formValues = {
        email: values?.email?.trim()?.toLowerCase(),
      };
      await forgetPasswordMutating({
        variables: { data: { ...formValues } },
      });
    } catch (error) {
      return error;
    }
  };
  return (
    <div className="login-wrap d-flex align-center justify-center">
      <Card className="full-width">
        <div className="text-center">
          <Logo />
          <h2 className="text-center mt-8">Forgot Your Password ?</h2>
          <p className="text-center">
            Don't worry. Recovering the password is easy. Just tell us the
            email.
          </p>
        </div>
        <Spin spinning={false}>
          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item
              name="email"
              rules={[{ required, message: 'Please enter email!' }, email]}
            >
              <Input prefix={<UserOutlined />} placeholder="Enter email" />
            </Form.Item>
            <Form.Item className="full-width mb-8">
              <Button
                type="primary"
                loading={loading}
                className="full-width"
                htmlType="submit"
              >
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
      <div className="text-center login-copyrights">
        Logicwind © {new Date()?.getFullYear()}
      </div>
    </div>
  );
};

export default ForgetPassword;
