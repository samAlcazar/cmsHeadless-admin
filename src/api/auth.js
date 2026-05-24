import { post, get } from './client'

export const login = (credentials) => post('/auth/login', credentials)
export const register = (data) => post('/auth/register', data)
export const getMe = () => get('/auth/me')
