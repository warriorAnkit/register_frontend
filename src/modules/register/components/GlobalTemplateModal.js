/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
import { useQuery,useLazyQuery } from '@apollo/client';
import { Alert, Card, Col, Empty, Input, message, Modal, Row, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { ROUTES } from '../../../common/constants';
import CenteredSpin from '../../Dashboard/component/CentredSpin';
import { GET_GLOBAL_TEMPLATE_BY_ID, LIST_GLOBAL_TEMPLATES } from '../graphql/Queries';


const { Title } = Typography;
const { Search } = Input;

const GlobalTemplateModal = ({ visible, onClose }) => {
  const [globalTemplates, setGlobalTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoadingTemplates,setIsLoadingTemplate] = useState(false);
  const [filteredTemplates, setFilteredTemplates] = useState([]);

  // Query to fetch global templates
  const { loading: loadingGlobal, error: errorGlobal, data: dataGlobal } = useQuery(
    LIST_GLOBAL_TEMPLATES,
  );
  const [getGlobalTemplateById, { loading:globalTemplateLoading, data:globalTemplateData, error:globalTemplateError }] = useLazyQuery(GET_GLOBAL_TEMPLATE_BY_ID, {
    fetchPolicy: 'cache-and-network',
  });
  useEffect(() => {
    if (dataGlobal) {
      setGlobalTemplates(dataGlobal.getAllGlobalTemplate);
      setFilteredTemplates(dataGlobal.getAllGlobalTemplate);
      setLoading(false);
    }

    if (errorGlobal) {
      setError(errorGlobal.message);
      setLoading(false);
    }
  }, [dataGlobal, errorGlobal]);

  const navigate = useNavigate();
  // const handleTemplateSelect = async (templateId) => {
 const handleTemplateSelect = async (templateId) => {
  setIsLoadingTemplate(true);
  try {
    const { data } = await getGlobalTemplateById({ variables: { id: templateId } });

    if (!data) {
      message.error('No data found for the selected template.');
      return;
    }

    // Extract and clean data
    const templateName = data.getGlobalTemplateById.name;
    const cleanData = (obj) => {
      const { __typename, id, deletedAt, ...rest } = obj;
      return { tempId: uuidv4(), ...rest };
    };

    const fields = data.getGlobalTemplateById.fields
      .filter((field) => !field.deletedAt)
      .map(cleanData);

    const properties = data.getGlobalTemplateById.properties.map(cleanData);

    const transformedData = { fields, properties };

    onClose(); // Close any modal or overlay
    navigate(
      ROUTES.NEW_REGISTER.replace(':registerName', templateName),
      { state: { transformedData } },
    );
  // eslint-disable-next-line no-shadow
  } catch (error) {
    console.error('Error fetching or processing template data:', error);
    message.error('An error occurred while fetching the template.');
  } finally {
    setIsLoadingTemplate(false); // Hide loader
  }
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    const filtered = globalTemplates.filter(template =>
      template.name.toLowerCase().includes(value),
    );
    setFilteredTemplates(filtered);
  };

  return (
    <Modal
      title="Global Templates"

      visible={visible}
      onCancel={onClose}
     footer={false}
      width={800}
    >
      {loading ? (
       <CenteredSpin/>
      ) : error ? (
        <Alert message="Error" description={error} type="error" showIcon />
      ) : (
        <div>
          <Title level={4}>Select a Template</Title>
          <Search
            placeholder="Search templates by name"
            onChange={handleSearch}
            style={{ marginBottom: 16 }}
            maxLength={100}
          />
          <Row gutter={[16, 16]}>
          {filteredTemplates.length > 0 ? (
    filteredTemplates.map(template => (
      <Col
        xs={24} // Full width on extra-small screens
        sm={12} // Two columns on small screens
        md={8} // Three columns on medium screens
        lg={8} // Three columns on large screens
        key={template.id}
      >
        <Card
          hoverable
          style={{
            textAlign: 'center',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            height: '100%',
            transition: 'transform 0.2s',
          }}
          onClick={() => handleTemplateSelect(template.id)}
          bodyStyle={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '150px', // Set a fixed height for uniformity
          }}
        >
          <Title level={5} style={{ margin: 0, fontSize: '1.2rem', color: '#595959' }}>
            {template.name}
          </Title>
        </Card>
      </Col>
    ))
  ) : (
    <Col span={24}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Empty
          description="No templates found."
        />
      </div>
    </Col>
  )}
          </Row>
          {isLoadingTemplates && <CenteredSpin />}
        </div>
      )}
    </Modal>
  );
};

export default GlobalTemplateModal;
