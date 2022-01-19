import { GET_BUGS } from "../bug_actions/projectBug-actions"

const INITIAL_STATE = {
    bugList: [],   // initial state - no project
    error: null,    // tranzition => either add project or error
    fetching: false,    // = pending
    fetched: false     // ?
}

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case 'GET_BUGS_PENDING':
        case 'ADD_BUG_PENDING':
        case 'UPDATE_BUG_PENDING':
        case 'DELETE_BUG_PENDING':
            return { ...state, error: null, fetching: true, fetched: false }
        case 'GET_BUGS_FULFILLED':
        case 'ADD_BUG_FULFILLED':
        case 'UPDATE_BUG_FULFILLED':
        case 'DELETE_BUG_FULFILLED':
            return { ...state, bookList: action.payload, fetching: false, fetched: true }
        case 'GET_BUGS_REJECTED':
        case 'ADD_BUG_REJECTED':
        case 'UPDATE_BUG_REJECTED':
        case 'DELETE_BUG_REJECTED':
            return { ...state, error: action.payload, fetching: false, fetched: true }
        default:
            return state
    }
}