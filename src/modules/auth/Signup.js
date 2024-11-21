import { useMutation } from '@apollo/client';
import { Button, Card, Form, Input, Space, Spin } from 'antd';
import React from 'react';
import { Logo } from '../../assets/svg';
import { ROUTES } from '../../common/constants';
import { formValidatorRules } from '../../common/utils';
import { messageContext } from '../../components/AppContextHolder';
import useRouter from '../../hooks/useRouter';
import { SIGNUP } from './graphql/Mutations';

const { required, email } = formValidatorRules;

const Signup = () => {
  const { navigate } = useRouter();
  const [signupMutate, { loading: signupLoading }] = useMutation(SIGNUP, {
    onError() {}, // Always write this method for error handling in all mutation.
  });

  const onFinish = async (values) => {
    try {
      const formValues = {
        email: values?.email?.trim().toLowerCase(),
        firstName: values?.firstName?.trim(),
        lastName: values?.lastName?.trim(),
        name: values?.name?.trim(),
        password: values?.password?.trim(),
      };
      const response = await signupMutate({
        variables: { data: { ...formValues } },
      });
      if (response) {
        navigate(ROUTES?.LOGIN, { replace: true });
      }
    } catch (error) {
      if (error?.message) {
        messageContext?.error(error?.message);
      } else {
        messageContext?.error('Something went wrong');
      }
    }
  };
  return (
    <div className="login-wrap d-flex align-center justify-start">
      <Card className="full-width">
        <Spin spinning={signupLoading} wrapperClassName="full-width">
          <div className="text-center mb-0">
            <Logo />
            <h2 className="text-center">Signup</h2>
          </div>
          <Form
            name="Signup"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
          >
            <Form.Item
              name="email"
              rules={[{ required, message: 'Please enter email!' }, email]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required, message: 'Please enter password!' }]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
            <Form.Item name="name">
              <Input placeholder="Enter username" />
            </Form.Item>
            <Form.Item name="firstName">
              <Input placeholder="Enter firstname" />
            </Form.Item>
            <Form.Item name="lastName">
              <Input placeholder="Enter lastname" />
            </Form.Item>
            <Form.Item className="full-width mb-8">
              <Button type="primary" className="full-width" htmlType="submit">
                Signup
              </Button>
            </Form.Item>
            <Form.Item className="text-center mb-0">
              <Space>
                Already have an account ?
                <Button
                  type="link"
                  className="p-0"
                  onClick={() => {
                    navigate(ROUTES?.LOGIN);
                  }}
                >
                  Login
                </Button>
              </Space>
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

export default Signup;
