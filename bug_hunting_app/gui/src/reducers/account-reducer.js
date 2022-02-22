import { GET_ACCOUNTS } from "../account_actions/account_actions"

const INITIAL_STATE = {
    accountList: [],   // initial state - no project
    error: null,    // tranzition => either add project or error
    fetching: false,    // = pending
    fetched: false     // ?
}

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case 'GET_ACCOUNTS_PENDING':
        case 'ADD_ACCOUNT_PENDING':
        case 'UPDATE_ACCOUNT_PENDING':
        case 'DELETE_ACCOUNT_PENDING':
            return { ...state, error: null, fetching: true, fetched: false }
        case 'GET_ACCOUNTS_FULFILLED':
        case 'ADD_ACCOUNTS_FULFILLED':
        case 'UPDATE_ACCOUNT_FULFILLED':
        case 'DELETE_ACCOUNT_FULFILLED':
            return { ...state, accountList: action.payload.records, fetching: false, fetched: true }
        case 'GET_ACCOUNTS_REJECTED':
        case 'ADD_ACCOUNT_REJECTED':
        case 'UPDATE_ACCOUNT_REJECTED':
        case 'DELETE_ACCOUNT_REJECTED':
            return { ...state, accountList: [], error: action.payload, fetching: false, fetched: true }
        default:
            return state
    }
}