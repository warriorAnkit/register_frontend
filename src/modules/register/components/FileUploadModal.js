
/* eslint-disable no-console */
import React, { useState } from 'react';
import { Modal, Upload, Button, message, Input } from 'antd';
import { DownloadOutlined} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse'; // Import Papa Parse
import { ROUTES } from '../../../common/constants';

const sampleFormat = ["Type", "Field Name", "Field Type", "Is Required", "Options"]; // Define the expected headers

const validateFileFormat = (headers) =>
  // Check if all required headers are present
   sampleFormat.every((header) => headers.includes(header))
;

const transformData = (parsedData) => {


  const fields = parsedData
    .filter(item => item.Type === "Field")
    .map(item => {
      const field = {
        fieldName: item["Field Name"],
        fieldType: item["Field Type"].toUpperCase().replace(/_/g, " "),
        isRequired: item["Is Required"].toLowerCase() === "yes",
      };

      if (field.fieldType === "OPTIONS" || field.fieldType === "CHECKBOXES") {
        field.options = item.Options ? item.Options.split(",") : [];
      } else {
        field.options = null;
      }

      return field;
    });

  const properties = parsedData
    .filter(item => item.Type === "Property")
    .map(item => {
      const property = {
        propertyName: item["Field Name"],
        propertyFieldType: item["Field Type"].toUpperCase().replace(/_/g, " "),
        isRequired: item["Is Required"].toLowerCase() === "yes",
      };

      if (property.propertyFieldType === "OPTIONS" || property.propertyFieldType === "CHECKBOXES") {
        property.options = item.Options ? item.Options.split(",") : [];
      } else {
        property.options = null;
      }

      return property;
    });

  return { fields, properties };
};

const FileUploadModal = ({ visible, onClose }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();


  const handleFileChange = ({ fileList }) => {
    setFile(fileList.length ? fileList[fileList.length-1] : null);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      message.error('Please select a file to upload!');
      return;
    }
    if (!name) {
      message.error('Please enter a name for the register!');
      return;
    }

    setLoading(true);


    // Parse the CSV or JSON file
    // eslint-disable-next-line no-undef
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const fileContent = fileReader.result;

      let parsedData;
      if (file.name.endsWith('.csv')) {
        // Parse CSV file
        const parsedResult = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
        });

        parsedData = parsedResult.data;

        const headers = parsedResult.meta.fields; // Extract headers

        if (!validateFileFormat(headers)) {
          message.error('File format does not match the required structure!');
          setLoading(false);
          return;
        }
      } else if (file.name.endsWith('.json')) {
        // Parse JSON file
        try {
          parsedData = JSON.parse(fileContent);
        } catch (error) {
          message.error('Failed to parse JSON file!');
          setLoading(false);
          return;
        }
      } else {
        message.error('Invalid file format! Only CSV are accepted.');
        setLoading(false);
        return;
      }

      // Transform the data after parsing
      const transformedData = transformData(parsedData);



      // Navigate to the new page and pass the transformed data and name
      navigate(ROUTES.NEW_REGISTER.replace(':registerName',name), { state: { transformedData } });

      // Reset file and close modal
      setFile(null);
      setName('');
      onClose();
      setLoading(false);
    };

    // Read the file content
    fileReader.readAsText(file.originFileObj);
  };

  return (
    <Modal
      visible={visible}
      title="Upload CSV File for Register Import"
      closable={false}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleUpload}
        >
          Upload
        </Button>,
      ]}
    >
      <div>
        {/* Input field for entering the name */}
        <Input
          placeholder="Enter the register name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginBottom: 20 }}
          maxLength={100}
        />
      </div>
      <Upload
        beforeUpload={() => false} // Disable automatic upload
        fileList={file ? [file] : []} // Only display the selected file
        onChange={handleFileChange}
        accept=".csv" // Accepted file formats
      >
        <Button icon={<DownloadOutlined />}>Select File</Button>
      </Upload>
      <div style={{ marginTop: 20 }}>
        <p>Accepted formats: CSV</p>
        <p>Ensure the file contains the correct structure for field data.</p>
        {/* Added link to sample file */}
        <p>Here is a <a href="https://drive.google.com/uc?export=download&id=11w2gqSmiAxiCN-tuVxee08XJhHZ66IqM" target="_blank" rel="noopener noreferrer"><strong>sample file</strong></a> to help you format your data correctly.</p>
      </div>
    </Modal>
  );
};

export default FileUploadModal;
