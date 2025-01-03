/* eslint-disable import/prefer-default-export */
import { gql } from "@apollo/client";

export const CREATE_TEMPLATE = gql`
  mutation CreateTemplate(
    $name: String!,
    $projectId: ID,
    $templateType: String!,
    $fields: [TableFieldInput!]!,
    $properties: [TemplatePropertyInput!]!
  ) {
    createTemplate(
      name: $name,
      projectId: $projectId,
      templateType: $templateType,
      fields: $fields,
      properties: $properties
    ) {
      data {
        id
        name
        status
        projectId
        createdById
        templateType
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
      message
    }
  }
`;
export const GENERATE_SIGNED_URL = gql`
  mutation generateSignedUrl($filename: String!, $fileType: String!) {
    generateSignedUrl(filename: $filename, fileType: $fileType) {
      signedUrl
    }
  }
`;

export const UPDATE_TEMPLATE = gql`
  mutation UpdateTemplate(
    $id: ID!,
    $name: String,
    $fields: [UpdateFieldInput!],
    $properties: [UpdatePropertyInput!]
  ) {
    updateTemplate(
      id: $id,
      name: $name,
      fields: $fields,
      properties: $properties
    ) {
      data {
        id
        name
        status
        projectId
        createdById
        templateType
        fields {
          id
          fieldName
          fieldType
          isRequired
          maxLength
          options
        }
        properties {
          id
          propertyName
          propertyFieldType
          isRequired
          maxLength
          options
        }
      }
      message
    }
  }
`;
export const SUBMIT_RESPONSE = gql`
  mutation SubmitResponse(
    $templateId: ID!,
    $tableEntries: [[FieldEntryInput!]],
    $propertyValues: [PropertyInput!]!
  ) {
    submitResponse(
      templateId: $templateId,
      tableEntries: $tableEntries,
      propertyValues: $propertyValues
    ) {
      success
      message
    }
  }
`;
export const CHANGE_TEMPLATE_STATUS = gql`
  mutation ChangeTemplateStatus($id: ID!, $newStatus: String!) {
    changeTemplateStatus(id: $id, newStatus: $newStatus) {
      data {
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
        }
        properties {
          id
          propertyName
          propertyFieldType
          maxLength
          options
          isRequired
        }
        createdById
      }
    }
  }
`;
export const EDIT_RESPONSE_MUTATION = gql`
  mutation editResponse(
    $setId: ID!,
    $propertyValues: [UpdatePropertyValueInput],
    $tableEntries: [[UpdateFieldEntryInput]]
  ) {
    editResponse(
      setId: $setId,
      propertyValues: $propertyValues,
      tableEntries: $tableEntries
    ) {
      success
      message
    }
  }
`;
export const DELETE_TEMPLATE = gql`
  mutation DeleteTemplate($id: ID!) {
    deleteTemplate(id: $id){
      success
      message
    }
  }
`;
export const CREATE_GLOBAL_TEMPLATE_MUTATION = gql`
  mutation createGlobalTemplate(
    $name: String!
    $templateType: String!
    $description: String
    $fields: [TableFieldInput!]!
    $properties: [TemplatePropertyInput!]!
  ) {
    createGlobalTemplate(
      name: $name
      templateType: $templateType
      description: $description
      fields: $fields
      properties: $properties
    ) {
    data {
      id
      name
    }
    message
  }
  }
`;
export const CREATE_SET = gql`
  mutation createSet($templateId: ID!, $propertyValues: [PropertyInput!]!) {
    createSet(templateId: $templateId, propertyValues: $propertyValues) {
      success
      setId
      message
    }
  }
`;
export const FIELD_RESPONSE_SUBMIT = gql`
  mutation fieldResponseSubmit($setId: ID!, $tableEntries: [[UpdateFieldEntryInput]],$rowNumberDelete: Int,$filling: Boolean) {
    fieldResponseSubmit(setId: $setId, tableEntries: $tableEntries,rowNumberDelete: $rowNumberDelete,filling: $filling) {
      success
      message
      updatedOrCreatedResponses {
        responseId
        fieldId
        value
        rowNumber
        status
      }
    }
  }
`;

export const EDIT_SET = gql`
mutation editSet($setId: ID!, $propertyValues: [UpdatePropertyValueInput]) {
  editSet(setId: $setId, propertyValues: $propertyValues) {
    success
    message
  }
}
`;