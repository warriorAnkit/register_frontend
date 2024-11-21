import { Modal } from 'antd';
import React from 'react';

const PreviewModal = (props) => {
  const {
    previewVisible = false,
    previewImage = '',
    previewTitle = '',
    setPreviewVisible,
    altName = 'Preview',
  } = props;

  return (
    <Modal
      wrapClassName="preview-modal"
      width={550}
      destroyOnClose
      centered
      open={previewVisible}
      title={previewTitle}
      footer={null}
      onCancel={() => {
        if (setPreviewVisible) {
          setPreviewVisible(false);
        }
      }}
    >
      <div className="center-image">
        <img
          alt={altName}
          src={previewImage}
          className="preview-image"
          width="500px"
        />
      </div>
    </Modal>
  );
};

export default PreviewModal;
