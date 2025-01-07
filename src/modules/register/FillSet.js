/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable no-alert */
import { useMutation, useQuery } from '@apollo/client';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CenteredSpin from '../Dashboard/component/CentredSpin';
import Header from './components/Header';
import { CREATE_SET} from './graphql/Mutation';
import { GET_TEMPLATE_BY_ID } from './graphql/Queries';
import './FillSet.less';
import SetPropertyField from './components/SetPropertyField';
import { ROUTES } from '../../common/constants';
import NavigationGuard from './components/NavigationGuard';

const FillSet = () => {
  const { templateId } = useParams();
  const [propertiesData, setPropertiesData] = useState({});
  const [propertyErrors, setPropertyErrors] = useState({});
  const [openedIndex, setOpenedIndex] = useState(false);
  const selectRef = useRef(null);
  const navigate =useNavigate();
  const { data, loading } = useQuery(GET_TEMPLATE_BY_ID, {
    variables: { id: templateId },
    fetchPolicy: 'cache-and-network',
  });

 const [createSet] = useMutation(CREATE_SET);
  useEffect(() => {
    if (data) {
      const initialProperties = {};
      data.getTemplateById.properties.forEach((property) => {
        initialProperties[property.propertyName] = '';
      });
      setPropertiesData(initialProperties);
    }
  }, [data]);


  // console.log(propertiesData);
  const finalValidateProperties = () => {
    const errors = {};
    data?.getTemplateById?.properties.forEach((property) => {
      const value = propertiesData[property.propertyName];

      if (property.isRequired &&
        (value === undefined ||
          value === null ||
          (typeof value === 'string' && value.trim() === '') ||
          (Array.isArray(value) && value.length === 0))
      ){
        errors[property.propertyName] = 'This field is required.';
      }

      if (property.isRequired  && property.propertyFieldType === 'TEXT' && value?.length > 100) {
        errors[property.propertyName] = 'Text must be less than 100 characters';
      }

      if ( property.isRequired && property.propertyFieldType === 'MULTI_LINE_TEXT' && value?.length > 750) {
        errors[property.propertyName] = 'Text must be less than 750 characters';
      }

      // eslint-disable-next-line no-restricted-globals
      if (property.isRequired && property.propertyFieldType === 'NUMERIC' && isNaN(value)) {
        errors[property.propertyName] = 'Value must be a valid number';
      }
      if (property.isRequired  && property.propertyFieldType === 'NUMERIC') {
        const numericRegex = /^\d{1,15}(\.\d{1,2})?$/; // Matches up to 15 digits before the decimal and up to 2 digits after

        if (!numericRegex.test(value)) {
          errors[property.propertyName] = 'Value must be a valid number with up to 15 digits before the decimal and up to 2 digits after.';
        } else {
          delete errors[property.propertyName];
        }
      }
    });

    setPropertyErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };
  const validateProperties = (propertyName, value) => {
    const errors = { ...propertyErrors };
    const property = data.getTemplateById?.properties.find(f => f.propertyName === propertyName);

    if ( property.isRequired &&
      (value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0))
    ) {
      errors[property.propertyName] = 'This field is required.';
    } else {
      delete errors[property.propertyName];
    }
    if (property.propertyFieldType === 'NUMERIC') {
      const numericRegex = /^\d{1,15}(\.\d{1,2})?$/; // Matches up to 15 digits before the decimal and up to 2 digits after

      if (!numericRegex.test(value)) {
        errors[property.propertyName] = 'Value must be a valid number with up to 15 digits before the decimal and up to 2 digits after.';
      } else {
        delete errors[property.propertyName];
      }
    }
    if (property.propertyFieldType === 'TEXT' && value?.length > 100) {
      errors[property.propertyName] = 'Text must be less than 100 characters';
    } else if (property.propertyFieldType === 'MULTI_LINE_TEXT' && value?.length > 750) {
      errors[property.propertyName] = 'Text must be less than 750 characters';
    } else if (property.propertyFieldType === 'NUMERIC' && Number.isNaN(Number(value))) {
      errors[property.propertyName] = 'Value must be a valid number';
    }

    setPropertyErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    const isPropertyValid = finalValidateProperties();

    if (!isPropertyValid) {
      return;
    }

    try {
      const propertyValues = Object.keys(propertiesData).map((propertyName) => ({
        propertyId: data.getTemplateById.properties.find(
          (prop) => prop.propertyName === propertyName,
        )?.id,
        value: String(propertiesData[propertyName]),
      }));

      const response = await createSet({
        variables: { templateId, propertyValues },
      });

      if (response.data.createSet.success) {
        const {setId} = response.data.createSet;
        const editEntriesRoute = ROUTES.FILL_TABLE
        .replace(':templateId', templateId)
        .replace(':setId', setId);
        navigate(editEntriesRoute, {
          state: { filling: true }, // Passing the flag via state
        });
      } else {
        alert(`Error: ${response.data.createSet.message}`);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while submitting the response.');
    }
  };

  // if (loading) {
  //   return <CenteredSpin />;
  // }
  return (
    <NavigationGuard
    confirmationMessage="You have unsaved changes. Are you sure you want to leave this page?"
  >
    <div className="fill-table">
      <Header name={data?.getTemplateById?.name} fillSet/>



      <div style={{marginTop: '80px ',paddingLeft:'10px '}}>
      {loading && <CenteredSpin/>}
      {!loading && (<>
      <div className="properties-section">
      <h2>Properties</h2>
        {Object.keys(propertiesData).length > 0 ? (
          Object.entries(propertiesData).map(([propertyName, value]) => {
            const property = data?.getTemplateById.properties.find(
              (p) => p.propertyName === propertyName,
            );
            return (
              <div key={propertyName} className="property-item">
                <strong>
                  {propertyName}
                  {property?.isRequired && <span className="required">*</span>}
                </strong>

                <SetPropertyField
                  propertyType={property.propertyFieldType}
                  propertyName={propertyName}
                  propertiesData={propertiesData}
                  setPropertiesData={setPropertiesData}
                  validateProperties={validateProperties}
                  propertyErrors={propertyErrors}
                  selectRef={selectRef}
                  setOpenedIndex={setOpenedIndex}
                  openedIndex={openedIndex}
                  data={data}
                />
              </div>
            );
          })
        ) : (
          <p>No properties data available.</p>
        )}
      </div>

      <div className="submit-section">
        <button type="button" onClick={handleSave}>Submit Response</button>
      </div>
      </>
      )}
    </div>

    </div>
    </NavigationGuard>
  );
};

export default FillSet;
