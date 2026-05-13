import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api'
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('studyai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('studyai_token');
      localStorage.removeItem('studyai_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const auth = {
  signup: (data) => API.post('/auth/signup', data),
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me')
};

export const ai = {
  summarize: (text, title, subject) =>
    API.post('/ai/summarize', { text, title, subject }),
  summarizePDF: (formData) =>
    API.post('/ai/summarize-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  chat: (message, chatId, history) =>
    API.post('/ai/chat', { message, chatId, history }),
  generateQuiz: (topic, count) =>
    API.post('/ai/generate-quiz', { topic, count }),
  studyPlan: (description) =>
    API.post('/ai/study-plan', { description })
};

export const notes = {
  getAll: (params) => API.get('/notes', { params }),
  getOne: (id) => API.get(`/notes/${id}`),
  update: (id, data) => API.patch(`/notes/${id}`, data),
  delete: (id) => API.delete(`/notes/${id}`)
};

export const quiz = {
  save: (topic, questions) => API.post('/quiz', { topic, questions }),
  submit: (id, score) => API.post(`/quiz/${id}/submit`, { score }),
  getAll: () => API.get('/quiz')
};

export default API;
