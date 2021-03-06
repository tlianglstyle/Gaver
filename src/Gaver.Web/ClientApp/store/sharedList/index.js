import Immutable from 'seamless-immutable'
import * as Api from './api'
import { isDevelopment, tryOrNotify, getQueryVariable } from 'utils'
import { normalize } from 'normalizr'
import * as schemas from 'schemas'
import { loadMessages } from 'store/chat'
import { deepMerge } from 'utils/immutableExtensions'
import { loadIdToken } from 'utils/auth'
import { HubConnection } from '../../signalr/HubConnection'
import { showError } from 'utils/notifications'
import { replace, push } from 'react-router-redux'
import { AccessStatus } from 'enums'

const initialState = Immutable({})

const namespace = 'gaver/sharedList/'

const DATA_LOADED = namespace + 'DATA_LOADED'
const SET_USERS = namespace + 'SET_USERS'
const SET_BOUGHT_SUCCESS = namespace + 'SET_BOUGHT_SUCCESS'
const CLEAR_STATE = namespace + 'CLEAR_STATE'
const SET_AUTHORIZED = namespace + 'SET_AUTHORIZED'

function dataLoaded(data) {
  return {
    type: DATA_LOADED,
    data
  }
}

function setBoughtSuccess({wishId, isBought, userId}) {
  return {
    type: SET_BOUGHT_SUCCESS,
    wishId,
    isBought,
    userId
  }
}

function setAuthorized() {
  return {
    type: SET_AUTHORIZED
  }
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case DATA_LOADED: {
      const wishListId = action.data.result
      return state.set('wishes', action.data.entities.wishes)
        .update('users', users => users ? users.merge(action.data.entities.users || initialState) : action.data.entities.users)
        .set('owner', action.data.entities.wishLists[wishListId].owner)
        .set('listId', wishListId)
    }
    case SET_BOUGHT_SUCCESS:
      return state.setIn(['wishes', action.wishId, 'boughtByUser'], action.isBought ? action.userId : null)
    case SET_USERS:
      return state::deepMerge(action.data.entities)
        .set('currentUsers', action.data.result)
    case SET_AUTHORIZED:
      return state.set('isAuthorized', true)
    case CLEAR_STATE:
      return initialState
  }
  return state
}

export const loadSharedList = listId => async dispatch => tryOrNotify(async () => {
  const data = await Api.loadSharedList(listId)
  dispatch(dataLoaded(data))
})

export const setBought = ({listId, wishId, isBought}) => async (dispatch, getState) => tryOrNotify(async () => {
  await Api.setBought({ listId, wishId, isBought })
  dispatch(setBoughtSuccess({ wishId, isBought, userId: getState().user.id }))
})

let listHub

export const subscribeList = (listId, token) => async dispatch => tryOrNotify(async () => {
  if (token) {
    try {
      await Api.registerToken(listId, token)
    } catch (error) {
      showError(error)
      dispatch(replace('/'))
      return
    }
  }
  const accessStatus = await Api.checkSharedListAccess(listId)
  switch (accessStatus) {
    case AccessStatus.NotInvited:
      showError('Du er ikke invitert til denne listen')
      // TODO: Egen side for å be om tilgang
      dispatch(replace('/'))
      return
    case AccessStatus.Owner:
      dispatch(replace('/'))
      return
    case AccessStatus.Invited:
      dispatch(setAuthorized())
      break
  }

  dispatch(loadSharedList(listId))
  const idToken = loadIdToken()
  listHub = new HubConnection(`http://${document.location.host}/listHub`, 'formatType=json&format=text&id_token=' + idToken)

  listHub.on('updateUsers', data => dispatch(setUsers(Immutable(normalize(data.currentUsers, schemas.users)))))
  listHub.on('refresh', () => {
    dispatch(loadSharedList(listId))
    dispatch(loadMessages(listId))
  })
  await listHub.start()
  const users = await listHub.invoke('subscribe', listId)
  listHub.methods['updateUsers'](users)
})

function clearState() {
  return {
    type: CLEAR_STATE
  }
}

export const unsubscribeList = listId => async dispatch => tryOrNotify(async () => {
  dispatch(clearState())
  if (listHub) {
    await listHub.invoke('unsubscribe', listId)
    await listHub.stop()
    listHub = null
  }
})

export function setUsers(data) {
  return {
    type: SET_USERS,
    data
  }
}

export const showMyList = () => dispatch => {
  dispatch(push('/'))
}