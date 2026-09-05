import api from './axios'

// Profile/account actions — same /users backend group as auth.api.js,
// split out here because they belong to the Settings page, not the auth flow.
export const updateProfile = (payload) =>
  api.patch('/users/update-profile', payload).then((res) => res.data.data)

export const changePassword = (payload) =>
  api.patch('/users/change-password', payload).then((res) => res.data.data)

export const deleteAccount = () =>
  api.delete('/users/delete-account').then((res) => res.data.data)
