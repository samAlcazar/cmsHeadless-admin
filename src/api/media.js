import { get, post, patch, del } from './client'

export const getMediaItems = () => get('/media')
export const getMediaItem = (id) => get(`/media/${id}`)
export const createMediaItem = (data) => post('/media', data)
export const updateMediaItem = (id, data) => patch(`/media/${id}`, data)
export const deleteMediaItem = (id) => del(`/media/${id}`)
