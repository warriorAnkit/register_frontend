/* eslint-disable import/prefer-default-export */
import { gql } from '@apollo/client';


export const GET_TEMPLATE_BY_ID = gql`
  query getTemplateById($id: ID!) {
    getTemplateById(id: $id) {
      id
      name
      status
      projectId
      fields {
        id
        fieldName
        fieldType
        maxLength
        isRequired
        options
        deletedAt
      }
      properties {
        id
        propertyName
        propertyFieldType
        maxLength
        isRequired
        options
      }
      createdById
    }
  }
`;
export const GET_ALL_RESPONSES_FOR_SET = gql`
  query GetAllResponsesForSet($setId: ID!) {
    getAllResponsesForSet(setId: $setId) {
      setDetails {
      id
      createdBy
      createdAt
      updatedBy
      updatedAt
    }
      fieldResponses {
        rowNumber
        id
        fieldId
        value

      }
      propertyResponses {
      id
      propertyId
      value
      createdAt
      }
    }
  }
`;
export const LIST_GLOBAL_TEMPLATES = gql`
  query GetAllGlobalTemplate {
    getAllGlobalTemplate {
      id
      name
      description
    }
  }
`;
export const GET_GLOBAL_TEMPLATE_BY_ID = gql`
  query GetGlobalTemplateById($id: ID!) {
    getGlobalTemplateById(id: $id) {
      id
      name
      fields {
        id
        fieldName
        fieldType
        isRequired
        options
      }
      properties {
        id
        propertyName
        propertyFieldType
        isRequired
        options
      }

    }
  }
`;
export const GET_ALL_PROPERTY_RESPONSES_FOR_TEMPLATE = gql`
  query GetAllPropertyResponsesForTemplate($templateId: ID!) {
    getAllPropertyResponsesForTemplate(templateId: $templateId) {
      success
      propertyResponses {
        setId
        propertyResponses {
          createdAt
          id
          value
          propertyId
          createdById
        }
      }
    }
  }
`;

export const GET_ALL_RESPONSES_FOR_TEMPLATE = gql`
  query GetAllResponsesForTemplate($templateId: ID!) {
    getAllResponsesForTemplate(templateId: $templateId) {
      success
      responses {
        setId
        propertyResponses {
          createdAt
          id
          value
          propertyId
        }
        fieldResponses {
          id
          rowNumber
          value
          fieldId
        }
      }
    }
  }
`;



export const GET_ALL_SETS_FOR_ALL_TEMPLATES = gql`
  query getAllSetsForAllTemplates {
    getAllSetsForAllTemplates {
      setId
      templateName
      createdAt
      userId
      updatedAt
      updatedBy
      templateId
    }
  }
`;

export const GET_ACTIVITY_LOGS_BY_SET_ID = gql`
  query GetActivityLogsBySetId($setId: ID!) {
    getActivityLogsBySetId(setId: $setId) {
      id
      actionType
      entityType
      entityName
      entityId
      changes
      rowNumber
      templateName
      editedBy
      timestamp

    }
  }
`;
export const GET_TEMPLATE_ACTIVITY_LOGS_BY_TEMPLATE_ID = gql`
  query  getTemplateActivityLogsBytemplateId($templateId: ID!) {
    getTemplateActivityLogsBytemplateId(templateId: $templateId) {
      id
      actionType
      entityType
      entityName
      entityId
      changes
      templateName
      editedBy
      timestamp
    }
  }
`;