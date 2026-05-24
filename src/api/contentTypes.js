import { get, post, del } from './client'

export const getContentTypes = () => get('/content-types')
export const getContentType = (id) => get(`/content-types/${id}`)
export const createContentType = (data) => post('/content-types', data)
export const deleteContentType = (id) => del(`/content-types/${id}`)
