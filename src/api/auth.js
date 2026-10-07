import api from './api'

export function registerUser(user) {
  return api.post('/auth/register', user).then(({ data }) => data)
}

export function loginUser(email, password) {
  return api.post('/auth/login', { email, password }).then(({ data }) => data)
}

export function getCurrentUser() {
  return api.get('/auth/me').then(({ data }) => data)
}
