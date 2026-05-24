import { get, post, patch, del } from './client'

export const getAuthors = () => get('/authors')
export const getAuthor = (id) => get(`/authors/${id}`)
export const createAuthor = (data) => post('/authors', data)
export const updateAuthor = (id, data) => patch(`/authors/${id}`, data)
export const deleteAuthor = (id) => del(`/authors/${id}`)
