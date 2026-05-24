import { get, post, patch, del } from './client'

export const getEntries = (contentType) => get(`/${contentType}`)
export const getEntry = (contentType, id) => get(`/${contentType}/${id}`)
export const createEntry = (contentType, data) => post(`/${contentType}`, data)
export const updateEntry = (contentType, id, data) => patch(`/${contentType}/${id}`, data)
export const deleteEntry = (contentType, id) => del(`/${contentType}/${id}`)
