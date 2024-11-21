/* eslint-disable default-case */
import { Button, Form, Input, Select, Space } from 'antd';
import { map } from 'lodash';
import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/bootstrap.css';
import { GENDER, REGEX } from '../../../../common/constants';

const tailLayout = {
  wrapperCol: {
    span: 16,
  },
};
const ConditionForm = () => {
  const [form] = Form.useForm();
  const onGenderChange = (value) => {
    switch (value) {
      case 'male':
        form.setFieldsValue({
          note: 'Hi, man!',
        });
        return;
      case 'female':
        form.setFieldsValue({
          note: 'Hi, lady!',
        });
        return;
      case 'other':
        form.setFieldsValue({
          note: 'Hi there!',
        });
    }
  };

  const onReset = () => {
    form.resetFields();
  };
  const onFill = () => {
    form.setFieldsValue({
      note: 'Hello world!',
      gender: 'male',
      contactNo: '+919874561230',
    });
  };
  return (
    <Form layout="vertical" form={form} name="control-hooks">
      <Form.Item
        name="note"
        label="Note"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input placeholder="Enter Note" />
      </Form.Item>
      <Form.Item
        name="gender"
        label="Gender"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select
          placeholder="Select a option and change input text above"
          onChange={onGenderChange}
          allowClear
        >
          {map(GENDER, (gender) => (
            <Select.Option key={gender?.value} value={gender?.value}>
              {gender?.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues?.gender !== currentValues?.gender
        }
      >
        {({ getFieldValue }) =>
          getFieldValue('gender') === 'other' ? (
            <Form.Item
              name="customizeGender"
              label="Customize Gender"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
          ) : null
        }
      </Form.Item>
      <Form.Item label="Contact No" name="contactNo">
        <PhoneInput
          inputClass="ant-input"
          inputProps={{
            name: 'phoneNo',
            required: true,
          }}
          defaultMask="(....) ... ...."
          alwaysDefaultMask
          placeholder="Enter Contact No"
          country="in"
          // countryCodeEditable={false} Note: This prop is useful, if you want to disable code edit.
          isValid={(value, country) => {
            const numberWithoutCode = value.replace(country?.countryCode, '');
            if (numberWithoutCode) {
              // eslint-disable-next-line no-param-reassign
              value = value?.split(' ')?.join('');
              const numberPattern = REGEX?.COUNTRY_CODE_PHONE;
              if (!numberPattern?.test(numberWithoutCode)) {
                // eslint-disable-next-line prefer-promise-reject-errors
                return 'Not a Valid Contact No';
              }
            }
            return true;
          }}
        />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Space size="small">
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
          <Button type="link" htmlType="button" onClick={onFill}>
            Fill form
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
export default ConditionForm;
