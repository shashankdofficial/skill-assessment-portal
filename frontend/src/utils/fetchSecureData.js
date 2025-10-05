// // frontend/src/utils/fetchSecureData.js
// import axios from 'axios';

// /**
//  * Data fetching util:
//  * - USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true'
//  * - getSecure(endpoint, token)  => GET request or mock
//  * - postSecure(endpoint, body, token) => POST request or mock
//  *
//  * endpoint is appended to API_BASE_URL, e.g. 'quiz/skill/1' => GET /api/quiz/skill/1
//  */

// export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
// export const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true'; // default: false if unset

// const axiosInstance = axios.create({
//   baseURL: API_BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
// });

// // -- Mock data (kept small & consistent with UI)
// const mockUser = {
//   id: 'user-123', name: 'Jane Doe', email: 'jane.doe@example.com', role: 'user', token: 'mock-jwt-token-user'
// };
// const mockAdmin = {
//   id: 'admin-456', name: 'Alex Admin', email: 'alex.admin@example.com', role: 'admin', token: 'mock-jwt-token-admin'
// };

// const mockData = {
//   skills: [
//     { id: 1, name: 'React Fundamentals', description: 'Core concepts of React hooks and components.' },
//     { id: 2, name: 'Node.js & Express', description: 'Backend routing, middleware, and API design.' },
//     { id: 3, name: 'MySQL Database', description: 'SQL queries, joins, and schema design.' },
//   ],
//   'user/reports': [
//     { id: 1, skillName: 'React Fundamentals', score: 85, date: '2024-10-01' },
//     { id: 2, skillName: 'Node.js & Express', score: 62, date: '2024-10-15' },
//     { id: 3, skillName: 'MySQL Database', score: 78, date: '2024-11-05' },
//   ],
//   'admin/users': [
//     { id: 1, name: 'Jane Doe', email: 'jane.doe@example.com', role: 'user', totalQuizzes: 3, avgScore: 75 },
//     { id: 2, name: 'Sam Smith', email: 'sam.smith@dev.com', role: 'user', totalQuizzes: 5, avgScore: 88 },
//   ],
//   'admin/questions/1': [
//     { id: 101, text: 'What is a React Hook?', skillId: 1, options: [{ id: 'A', text: 'A function that lets you use state and other React features.' }, { id: 'B', text: 'A special component that handles routing.' }, { id: 'C', text: 'A type of Redux action.' }], answer: 0 },
//     { id: 102, text: 'What does JSX stand for?', skillId: 1, options: [{ id: 'A', text: 'JavaScript XML' }, { id: 'B', text: 'JavaScript Syntax Extension' }, { id: 'C', text: 'JSON XHR' }], answer: 1 },
//   ],
//   'questions/2': [
//     { id: 201, text: 'What is middleware in Express?', skillId: 2, options: [{ id: 'A', text: 'A function that runs during request processing.' }, { id: 'B', text: 'A DB engine.' }], answer: 0 }
//   ]
// };

// // Simple mock GET
// function mockGet(endpoint, token) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       if (endpoint.startsWith('admin') && token && !token.includes('admin')) {
//         reject(new Error('Access Denied. Admin role required.'));
//         return;
//       }
//       const key = endpoint.includes('?') ? endpoint.split('?')[0] : endpoint;
//       if (mockData[key]) return resolve({ data: mockData[key] });
//       if (key.startsWith('quiz/skill/')) {
//         const sid = key.split('/')[2];
//         const mk = `admin/questions/${sid}`;
//         return resolve({ data: mockData[mk] || [] });
//       }
//       if (key.startsWith('skills')) return resolve({ data: mockData['skills'] });
//       if (key.startsWith('user/reports')) return resolve({ data: mockData['user/reports'] });
//       if (key.startsWith('admin/users')) return resolve({ data: mockData['admin/users'] });
//       resolve({ data: [] });
//     }, 300);
//   });
// }

// // Simple mock POST
// function mockPost(endpoint, body = {}, token) {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       if (endpoint === 'questions') {
//         const created = { id: Date.now(), ...body };
//         return resolve({ data: created });
//       }
//       if (endpoint === 'quiz/attempt') {
//         const attemptScore = Math.round(Math.random() * 100);
//         return resolve({ data: { attemptId: Date.now(), score: attemptScore, total: 100 } });
//       }
//       resolve({ data: { ok: true } });
//     }, 300);
//   });
// }

// // Exposed API:
// // getSecure(endpoint, token)
// // postSecure(endpoint, body, token)
// export async function getSecure(endpoint, token) {
//   if (USE_MOCK) {
//     return await mockGet(endpoint, token);
//   }
//   const resp = await axiosInstance.get(`/${endpoint}`, {
//     headers: token ? { Authorization: `Bearer ${token}` } : {}
//   });
//   return resp;
// }

// export async function postSecure(endpoint, body = {}, token) {
//   if (USE_MOCK) {
//     return await mockPost(endpoint, body, token);
//   }
//   const resp = await axiosInstance.post(`/${endpoint}`, body, {
//     headers: token ? { Authorization: `Bearer ${token}` } : {}
//   });
//   return resp;
// }


// frontend/src/utils/fetchSecureData.js
import api from '../api/axios';

export const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true'; // default false

// simple mock fallbacks so UI doesn't crash when using mock mode
async function mockGet(endpoint) {
  return { data: [] };
}
async function mockPost(endpoint, body) {
  return { data: { ok: true } };
}
async function mockPut(endpoint, body) {
  return { data: { ok: true } };
}
async function mockDelete(endpoint) {
  return { data: { ok: true } };
}

// GET request with auth
export async function getSecure(endpoint) {
  if (USE_MOCK) return mockGet(endpoint);
  return api.get(`/${endpoint}`);
}

// POST request with auth
export async function postSecure(endpoint, body) {
  if (USE_MOCK) return mockPost(endpoint, body);
  return api.post(`/${endpoint}`, body);
}

// PUT request with auth
export async function putSecure(endpoint, body) {
  if (USE_MOCK) return mockPut(endpoint, body);
  return api.put(`/${endpoint}`, body);
}

// DELETE request with auth
export async function deleteSecure(endpoint) {
  if (USE_MOCK) return mockDelete(endpoint);
  return api.delete(`/${endpoint}`);
}

