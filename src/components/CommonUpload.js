import { PlusOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';
import { filter } from 'lodash';
import React, { useState } from 'react';
import {
  fetchImage,
  getBase64,
  getSignedUrl,
  uploadImage,
} from '../common/utils';
import PreviewModal from './PreviewModal';

const CommonUpload = ({
  buttonRef,
  setImageUrls,
  multiple = false,
  imageUrls,
  showPreviewIcon = true,
  showRemoveIcon = true,
  setLoading,
  setImageAdded,
  ...rest
}) => {
  const [fileObj, setFileObj] = useState();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState();
  const [previewTitle, setPreviewTitle] = useState();

  const handlePreview = async (file) => {
    let preview;
    if (!file?.url && !file?.preview) {
      preview = await getBase64(file?.originFileObj);
    }
    setPreviewVisible(true);
    setPreviewTitle(
      file?.name ||
        file?.label ||
        file?.url?.substring(file?.url?.lastIndexOf('/') + 1),
    );
    setPreviewImage(file?.url || preview);
  };

  const handleRemove = async (file) => {
    // Note: You need to call delete mutation here to delete image from backend too.
    setImageUrls(filter(imageUrls, (item) => item?.id !== file?.uid));
  };

  return (
    <>
      <PreviewModal
        previewImage={previewImage}
        previewTitle={previewTitle}
        previewVisible={previewVisible}
        setPreviewVisible={setPreviewVisible}
      />
      <Upload
        beforeUpload={() => false}
        maxCount={!multiple && 1}
        onChange={async (info) => {
          if (info) {
            setFileObj(info);
            setImageAdded(false);
          } else {
            setFileObj();
            setImageAdded(true);
          }
        }}
        onRemove={handleRemove}
        onPreview={handlePreview}
        showUploadList={{
          showPreviewIcon,
          showRemoveIcon,
        }}
        {...rest}
      >
        {!multiple && fileObj?.fileList?.length === 1 ? null : (
          <PlusOutlined disabled={fileObj?.fileList?.length > 0 && !multiple} />
        )}
      </Upload>
      <Button
        hidden
        ref={buttonRef}
        onClick={async () => {
          // Note : This onClick code may vary according to project requirement
          setLoading(true);
          if (!multiple) {
            const response = await getSignedUrl(fileObj?.file);
            const signedRequest = response?.generateSignedUrl?.signedRequest;
            uploadImage(signedRequest, fileObj?.file);
            const getUrl = await fetchImage(fileObj?.file);
            setImageUrls([
              {
                id: fileObj?.file?.uid,
                url: getUrl?.generateSignedUrl?.signedRequest,
              },
            ]);
            setLoading(false);
          } else {
            const imagesList = [...imageUrls];
            // eslint-disable-next-line no-restricted-syntax
            for (const file of fileObj?.fileList) {
              // eslint-disable-next-line no-await-in-loop
              const response = await getSignedUrl(file);
              const signedRequest = response?.generateSignedUrl?.signedRequest;
              // eslint-disable-next-line no-await-in-loop
              await uploadImage(signedRequest, file);
              // eslint-disable-next-line no-await-in-loop
              const getUrl = await fetchImage(file);
              imagesList.push({
                id: file?.uid,
                url: getUrl?.generateSignedUrl?.signedRequest,
              });
            }
            setImageUrls(imagesList);
            setLoading(false);
          }
        }}
      />
    </>
  );
};

export default CommonUpload;
