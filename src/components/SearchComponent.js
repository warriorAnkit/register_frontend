import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { debounce } from 'lodash';
import React, { useState } from 'react';

let searchDebounce = null;

const SearchComponent = (props) => {
  const [query, setQuery] = useState('');
  const { name = '', getData, ...rest } = props;

  const handleChange = ({ target: { value } }) => {
    setQuery(value);
    if (getData) {
      if (searchDebounce) {
        searchDebounce.cancel();
        searchDebounce = null;
      }
      searchDebounce = debounce(getData, 500);
      searchDebounce(value);
    }
  };

  return (
    <Input
      className="search-component"
      allowClear
      placeholder={`Search ${name}`}
      value={query}
      name={name}
      onChange={handleChange}
      suffix={<SearchOutlined />}
      {...rest}
    />
  );
};

export default SearchComponent;
