import axios from 'axios'
import {
  RECEIVE_USERS, RECEIVE_USER, UPDATE_USER, DELETE_USER,
  REQUEST_ALL_USERS, BEGIN_UPLOADING,
  DONE_UPLOADING, REQUEST_USER, REQUEST_FILTERED_USERS } from '../constants'
import { whoami } from './auth'
import { receiveAlert } from './alert'

/* --------- PURE ACTION CREATORS --------- */

export const receiveAllUsers = users => ({
  users,
  type: RECEIVE_USERS
})

export const receiveUser = user => ({
  selected: user,
  type: RECEIVE_USER
})

export const beginUploading = () => ({
  type: BEGIN_UPLOADING
})

export const doneUploading = () => ({
  type: DONE_UPLOADING
})

export const requestFilteredUsers = () => ({
  type: REQUEST_FILTERED_USERS
})

export const requestUser = () => ({
  type: REQUEST_USER
})

export const updateUser = () => ({
  type: UPDATE_USER
})

export const deleteUser = () => ({
  type: DELETE_USER
})

export const requestAllUsers = () => ({
  type: REQUEST_ALL_USERS
})

/* --------- ASYNC ACTION CREATORS (THUNKS) --------- */

export const gettingAllUsers = () => dispatch => {
  dispatch(requestAllUsers())
  axios.get('/api/users')
    .then(res => res.data)
    .then(users => dispatch(receiveAllUsers(users)))
    .catch(err => console.error(`Mang, I couldn't find any users! ${err.stack}`))
}

export const gettingUserById = user_id => dispatch => {
  dispatch(requestUser())
  axios.get(`/api/users/${user_id}`)
    .then(res => res.data)
    .then(user => {
      dispatch(receiveUser(user))
    })
    .catch(err => console.error(`Mang I couldn't find the user! ${err.stack}`))
}

export const filteringUsers = query => dispatch => {
  dispatch(requestFilteredUsers())
  axios.post('/api/users/search', {query})
    .then(res => res.data)
    .then(users => dispatch(receiveAllUsers(users)))
    .catch(err => console.error(`Mang, I couldn't filter the users! ${err.stack}`))
}

export const advancedFilteringUsers = body => dispatch => {
  axios.post('/api/users/search/advanced', body)
    .then(res => res.data)
    .then(users => dispatch(receiveAllUsers(users)))
    .catch(err => console.error(`Mang, I couldn't advanced filter the users! ${err.stack}`))
}

export const buildBodyThenSearchUsers = (bodyBuilderFunc, coords) => {
  return dispatch => {
    dispatch(requestFilteredUsers())
    const body = bodyBuilderFunc(coords)
    dispatch(advancedFilteringUsers(body))
  }
}

export const creatingNewEmployer = employer => dispatch => {
  axios.post('/api/employers', employer)
    .then(res => res.data)
    .catch((err) => {
      console.error(err)
      dispatch(receiveAlert({
        type: 'error',
        style: 'danger',
        title: 'Uh Oh!',
        body: 'Sorry, we weren\'t able to create your account. Please try again. If trouble persists please contact us!',
        next: null
      }))
    })
}

export const updatingUser = (user, savedJobs) => dispatch => {
  // set loading state to true to trigger UI changes
  // update the user
  axios.put(`/api/users/${user.id}`, {user, savedJobs})
    .then(res => res.data)
    // if the user is successfully updated, we fetch the updated users list
    .then(updatedUser => {
      dispatch(whoami())
    })
    // otherwise we catch the error...
    .catch((err) => {
      console.error(err)
      let alertBody = savedJobs
        ? 'We were unable to save this job. Please try again, and let us know if trouble persists!'
        : 'Sorry, we\'re having trouble updating your profile at the moment. Please try again later.'
      dispatch(receiveAlert({
        type: 'error',
        style: 'danger',
        title: 'Uh Oh!',
        body: alertBody,
        next: null
      }))
    })
}

export const uploadingAvatar = (user, file) => dispatch => {
  dispatch(beginUploading())
  user.image_url = `https://colorforcode.s3.amazonaws.com/colorforcode/avatars/${file.name}`
  const options = {headers: {'Content-Type': file.type}}
  axios.get(
    `/api/users/avatars/sign-s3?&file-name=${file.name}&file-type=${file.type}`
  )
    .then(res => axios.put(res.data.signedRequest, file, options))
    .then(() => dispatch(updatingUser(user)))
    .then(() => dispatch(doneUploading()))
    .catch((err) => {
      console.error(err)
      dispatch(receiveAlert({
        type: 'error',
        style: 'danger',
        title: 'Uh Oh!',
        body: 'Sorry, we\'re having trouble uploading your profile picture. Please try again later.',
        next: null
      }))
    })
}

export const uploadingResume = (user, file) => dispatch => {
  dispatch(beginUploading())
  user.resume_url = `https://colorforcode.s3.amazonaws.com/colorforcode/resumes/${file.name}`
  const options = {headers: {'Content-Type': file.type}}
  axios.get(
    `/api/users/resumes/sign-s3?&file-name=${file.name}&file-type=${file.type}`
  )
    .then(res => axios.put(res.data.signedRequest, file, options))
    .then(() => dispatch(updatingUser(user)))
    .then(() => dispatch(doneUploading()))
    .catch((err) => {
      console.error(err)
      dispatch(receiveAlert({
        type: 'error',
        style: 'danger',
        title: 'Uh Oh!',
        body: 'Sorry, we\'re having trouble uploading your resume. Please try again.',
        next: null
      }))
    })
}
