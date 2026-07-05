import { apiClient } from './api';

const coursAnnulesApi = {
  getAll: () => apiClient('/api/CoursAnnules', { method: 'GET' }),
};

export default coursAnnulesApi;
