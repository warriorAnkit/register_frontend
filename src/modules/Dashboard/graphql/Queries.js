import { gql } from '@apollo/client';

// Query to get live templates by project
export const LIST_LIVE_TEMPLATES_BY_PROJECT = gql`
  query getLiveTemplatesByProject($projectId: ID!) {
    getLiveTemplatesByProject(projectId: $projectId) {
      id
      name
      status
      projectId
      createdById
      numberOfSets
      numberOfEntries
    }
  }
`;

// Query to get draft templates by project
export const LIST_DRAFT_TEMPLATES_BY_PROJECT = gql`
  query getDraftTemplatesByProject($projectId: ID!) {
    getDraftTemplatesByProject(projectId: $projectId) {
      id
      name
      status
      projectId
      createdById
      numberOfSets
      numberOfEntries
    }
  }
`;

// Query to get archived templates by project
export const LIST_ARCHIVED_TEMPLATES_BY_PROJECT = gql`
  query getArchiveTemplatesByProject($projectId: ID!) {
    getArchiveTemplatesByProject(projectId: $projectId) {
      id
      name
      status
      projectId
      createdById
      numberOfSets
      numberOfEntries
    }
  }
`;

export const GET_PROJECT_ID_FOR_USER = gql`
  query getProjectIdForUser {
    getProjectIdForUser
  }
`;