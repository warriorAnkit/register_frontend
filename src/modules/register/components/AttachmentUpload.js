/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
import { FileImageOutlined, FilePdfOutlined, PlusOutlined } from '@ant-design/icons';
import { Upload, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client'; // For calling the mutation

// Import the GraphQL mutation for generating signed URL
import { GENERATE_SIGNED_URL } from '../graphql/Mutation'; // Update with correct path to mutation

const ImageUpload = ({ onUploadSuccess, errorMessage, existingFileUrl }) => {
  const [loading, setLoading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(existingFileUrl || null);
  const [fileType, setFileType] = useState(null);

  // Use the GraphQL mutation to get the signed URL
  const [generateSignedUrl] = useMutation(GENERATE_SIGNED_URL);

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

  const handleFileUpload = async (file) => {
    setLoading(true);
    const fileName = `uploads/${Date.now()}_${file.name}`;
    const fileMimeType = file.type;
    setFileType(fileMimeType);
    try {
      // Call the mutation to get the signed URL
      console.log(fileType);
      const { data } = await generateSignedUrl({ variables: { filename: fileName , fileType:fileMimeType } });
      const {signedUrl} = data.generateSignedUrl;
      console.log(signedUrl);

      if (signedUrl) {
        // Upload the file to Google Cloud Storage using the signed URL
        const response = await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (response.ok) {
          message.success('File uploaded successfully');
          setUploadedFileUrl(signedUrl.split('?')[0]); // Get the URL without query parameters
          setFileType(file.type);
          onUploadSuccess(signedUrl.split('?')[0]);
        } else {
          throw new Error('File upload failed');
        }
      }
    } catch (error) {
      message.error('File upload failed');
      console.error(error);
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
