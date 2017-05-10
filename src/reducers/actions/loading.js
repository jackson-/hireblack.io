import { CREATE_JOB, REQUEST_JOBS, CREATE_USER, REQUEST_USERS } from '../constants'

/* --------- PURE ACTION CREATORS ---------*/

export const createNewJob = () => ({
  type: CREATE_JOB,
  loading: true
})

export const requestAllJobs = () => ({
  type: REQUEST_JOBS,
  loading: true
})

export const createNewUser = () => ({
  type: CREATE_USER,
  loading: true
})

export const requestAllUsers = () => ({
  type: REQUEST_USERS,
  loading: true
})
