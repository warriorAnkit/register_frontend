/* eslint-disable no-nested-ternary */
/* eslint-disable no-console */

import React, { useEffect, useState } from 'react';
import { Upload, message } from 'antd';
import AWS from 'aws-sdk';
import { FilePdfOutlined, FileImageOutlined, PlusOutlined } from '@ant-design/icons';

const ImageUpload = ({ onUploadSuccess, errorMessage, existingFileUrl }) => {
  const [loading, setLoading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(existingFileUrl || null);
  const [fileType, setFileType] = useState(null);

  useEffect(() => {
    if (existingFileUrl) {
      const ext = existingFileUrl.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) {
        setFileType('image/');
      } else if (ext === 'pdf') {
        setFileType('application/pdf');
      }
      setUploadedFileUrl(existingFileUrl);
    } else {
      setUploadedFileUrl(null);
      setFileType(null);
    }
  }, [existingFileUrl]);

  // AWS S3 configuration
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_AWS_S3_REGION,
  });

  const s3 = new AWS.S3();
  const handleFileUpload = async (file) => {
    setLoading(true);
    const fileName = `uploads/${Date.now()}_${file.name}`;
    const params = {
      Bucket: process.env.REACT_APP_AWS_S3_PUBLIC_BUCKET_NAME,
      Key: fileName,
      Body: file,
      ACL: 'public-read',
      ContentType: file.type,
    };

    try {
      const data = await s3.upload(params).promise();
      message.success('File uploaded successfully');
      setUploadedFileUrl(data.Location);
      setFileType(file.type);
      onUploadSuccess(data.Location);
    } catch (error) {
      message.error('File upload failed');
      // console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  // Custom request for file upload
  const customRequest = ({ file, onSuccess, onError }) => {
    handleFileUpload(file)
      .then((url) => {
        onSuccess(url);
      })
      .catch((error) => {
        console.log(error);
        onError(error);
      });
  };

  // Validate file before upload (image or PDF, max 5MB)
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    const isValidSize = file.size / 1024 / 1024 < 5; // Limit file size to 5MB

    if (!isImage && !isPDF) {
      message.error('You can only upload image or PDF files!');
      return Upload.LIST_IGNORE;
    }

    if (!isValidSize) {
      message.error('File must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  return (
    <div>
      {/* Show uploaded file preview */}
      {uploadedFileUrl ? (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          {fileType && fileType.startsWith('image/') ? (
            <FileImageOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          ) : fileType && fileType === 'application/pdf' ? (
            <FilePdfOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
          ) : null}
          <div>
            <a
              href={uploadedFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              Open File
            </a>
          </div>
        </div>
      ) : (
        <Upload
          customRequest={customRequest}
          showUploadList={false}
          accept="image/*,.pdf"
          beforeUpload={beforeUpload}
          maxCount={1}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload Image or PDF</div>
          </div>
        </Upload>
      )}

      {/* Display loading state */}
      {loading && <div>Uploading...</div>}

      {/* Display error message if any */}
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
    </div>
  );
};

export default ImageUpload;
