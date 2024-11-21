/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import { Modal, Card, Input, Button, Typography, Spin, Alert, Row, Col } from 'antd';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { LIST_GLOBAL_TEMPLATES } from '../graphql/Queries';
import { ROUTES } from '../../../common/constants';

const { Title } = Typography;
const { Search } = Input;

const GlobalTemplateModal = ({ visible, onClose }) => {
  const [globalTemplates, setGlobalTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredTemplates, setFilteredTemplates] = useState([]);

  // Query to fetch global templates
  const { loading: loadingGlobal, error: errorGlobal, data: dataGlobal } = useQuery(
    LIST_GLOBAL_TEMPLATES,
  );

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

  const handleTemplateSelect = (templateId) => {
    onClose();
    navigate(ROUTES.GLOBAL_TEMPLATE_VIEW.replace(':globalTemplateId', templateId));
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
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={800}
    >
      {loading ? (
        <Spin size="large" />
      ) : error ? (
        <Alert message="Error" description={error} type="error" showIcon />
      ) : (
        <div>
          <Title level={4}>Select a Template</Title>
          <Search
            placeholder="Search templates by name"
            onChange={handleSearch}
            style={{ marginBottom: 16 }}
          />
          <Row gutter={[16, 16]}>
            {filteredTemplates.map(template => (
              <Col
                xs={24}   // Full width on extra-small screens
                sm={12}   // Two columns on small screens
                md={8}    // Three columns on medium screens
                lg={8}    // Three columns on large screens
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
            ))}
          </Row>
        </div>
      )}
    </Modal>
  );
};

export default GlobalTemplateModal;
