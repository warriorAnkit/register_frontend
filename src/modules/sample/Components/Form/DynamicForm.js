import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import React from 'react';

const DynamicForm = () => (
  <Form name="dynamic_form_item" layout="vertical">
    <Form.List
      name="names"
      rules={[
        {
          validator: (_, names) => {
            if (!names || names?.length < 2) {
              return Promise.reject(new Error('At least 2 passengers'));
            }
          },
        },
      ]}
    >
      {(fields, { add, remove }, { errors }) => (
        <>
          {fields?.map((field, index) => (
            <Form.Item
              label={index === 0 ? 'Passengers' : ''}
              required={false}
              key={field?.key}
            >
              <Form.Item
                {...field}
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message:
                      "Please input passenger's name or delete this field.",
                  },
                ]}
                noStyle
              >
                <Input
                  className="width-percent-80"
                  placeholder="passenger name"
                />
              </Form.Item>
              {fields?.length > 1 ? (
                <MinusCircleOutlined
                  className="dynamic-delete-button width-percent-20"
                  onClick={() => remove(field?.name)}
                />
              ) : null}
            </Form.Item>
          ))}
          <Form.Item>
            <Button
              type="dashed"
              onClick={add}
              className="full-width"
              icon={<PlusOutlined />}
            >
              Add field
            </Button>
            <Button
              type="dashed"
              onClick={() => {
                add('The head item', 0);
              }}
              className="full-width mt-16"
              icon={<PlusOutlined />}
            >
              Add field at head
            </Button>
            <Form.ErrorList errors={errors} />
          </Form.Item>
        </>
      )}
    </Form.List>
    <Form.Item>
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </Form.Item>
  </Form>
);
export default DynamicForm;
