import { combineReducers } from 'redux'

import project from './project-reducer'
import bug from '../bug_reducers/project_bug-reducer'

//const initialState={project:{}, bug:{}}
const rootReducer=combineReducers({project, bug});


export default combineReducers({
    project, bug
})