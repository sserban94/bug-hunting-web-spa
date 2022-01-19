import { GET_PROJECTS } from "../actions/project-actions"

const INITIAL_STATE = {
    projectList: [],   // initial state - no project
    error: null,    // tranzition => either add project or error
    fetching: false,    // = pending
    fetched: false     // ?
}

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case 'GET_PROJECTS_PENDING':
        case 'ADD_PROJECT_PENDING':
        case 'UPDATE_PROJECT_PENDING':
        case 'DELETE_PROJECT_PENDING':
            return { ...state, error: null, fetching: true, fetched: false }
        case 'GET_PROJECTS_FULFILLED':
        case 'ADD_PROJECT_FULFILLED':
        case 'UPDATE_PROJECT_FULFILLED':
        case 'DELETE_PROJECT_FULFILLED':
            return { ...state, bookList: action.payload, fetching: false, fetched: true }
        case 'GET_PROJECTS_REJECTED':
        case 'ADD_PROJECT_REJECTED':
        case 'UPDATE_PROJECT_REJECTED':
        case 'DELETE_PROJECT_REJECTED':
            return { ...state, error: action.payload, fetching: false, fetched: true }
        default:
            return state
    }
}