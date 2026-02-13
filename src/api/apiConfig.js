import { BASE_URL } from "../config/api";   // <-- Only the base URL

export const getAuthHeaders = (isFormData = false) => {
  const token =
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbjJAYWRtaW4uY29tIiwiaXNzIjoiQXNodXRvc2giLCJhdWQiOiJBc2h1dG9zaC1jbGllbnQgU2lkZSIsImp0aSI6ImIwZDdkNWExLTNiYzgtNGNkYy05MjkyLTY5ZDIxY2JjMmUxZCIsInVzZXJJZCI6MTAwMDIsImF1dGhvcml0aWVzIjpbIlJPTEVfQURNSU4iXSwiaXNFbmFibGUiOnRydWUsInRva2VuX3R5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3Njg5ODUzMjUsIm5iZiI6MTc2ODk4NTMyNiwiZXhwIjoxNzcyNTg1MzI1LCJkZnAiOiJPdW1PQ1pnWUVWR2lsQ0RDVHVNWmJqbFYrRVFEaU8xaFF1eFpvZ1o1MFcwPSJ9.bZiejV-ZjT5vsyiiBf7xUTyUkG8zXZ0nSm1gFv1vwK8";

  if (isFormData) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};
