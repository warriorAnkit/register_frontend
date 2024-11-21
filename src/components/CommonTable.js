import { Table } from 'antd';
import React, { useEffect, useState } from 'react';

const TableComponent = (props) => {
  const {
    columns,
    data = [],
    onChange,
    loadingData = false,
    tableClassName = '',
    paginationConfig, // required for showing pagination
    ...rest
  } = props;

  const [paginationProps, setPaginationProps] = useState({
    pageSizeOptions: [10, 15, 20, 50, 100],
    defaultPageSize: 10,
    responsive: true,
    showSizeChanger: true,
    position: ['bottomCenter'],
  });

  useEffect(() => {
    setPaginationProps({ ...paginationProps, ...paginationConfig });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationConfig]);

  return (
    <Table
      columns={columns}
      bordered={false} // by default false if want then pass true from props
      dataSource={data}
      className={tableClassName}
      onChange={onChange} // for getting pagination,sorting and filter data
      pagination={paginationConfig ? paginationProps : false} // for server side or client side pagination
      loading={{
        spinning: loadingData, // keep it true to set loader
        size: 'large', // currently kept large loader
      }}
      {...rest}
    />
  );
};

export default TableComponent;
