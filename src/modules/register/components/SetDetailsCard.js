/* eslint-disable no-nested-ternary */
import React from 'react';
import { Card } from 'antd';
import moment from 'moment';
import './Component.less'; // Import the CSS file

const SetDetailsCard = ({ setData }) => {
  const { createdBy, createdAt, updatedBy, updatedAt } = setData || {};

  return (
    <Card className="details-card"
    bodyStyle={{ padding: 0 }}
      style={{ border: 'none', boxShadow: 'none' }}>
      <div className="details-item">
        <strong>Created By: </strong>
        <span>{createdBy || 'N/A'}</span>
      </div>
      <div className="details-item">
        <strong>Created At: </strong>
        <span>
          {createdAt
            ? moment(createdAt, 'x').isValid()
              ? moment(createdAt, 'x').format('YYYY-MM-DD HH:mm:ss')
              : 'Invalid Date'
            : '-'}
        </span>
      </div>
      <div className="details-item">
        <strong>Updated By: </strong>
        <span>{updatedBy || '-'}</span>
      </div>
      <div className="details-item">
        <strong>Updated At: </strong>
        {updatedAt
          ? moment(updatedAt, 'x').isValid()
            ? moment(updatedAt, 'x').format('YYYY-MM-DD HH:mm:ss')
            : 'Invalid Date'
          : '-'}
      </div>
    </Card>
  );
};

export default SetDetailsCard;
