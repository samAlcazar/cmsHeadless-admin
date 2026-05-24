import { get, post, patch, del } from './client'

export const getFieldsByContentType = (contentTypeId) => get(`/fields/content-type/${contentTypeId}`)
export const getField = (id) => get(`/fields/${id}`)
export const createField = (data) => post('/fields', data)
export const updateField = (id, data) => patch(`/fields/${id}`, data)
export const deleteField = (id) => del(`/fields/${id}`)
