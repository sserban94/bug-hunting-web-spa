import { SERVER } from '../config/global'

export const GET_BUGS = 'GET_BUGS'
export const ADD_BUG = 'ADD_BUG'
export const UPDATE_BUG = 'UPDATE_BUG'
export const DELETE_BUG = 'DELETE_BUG'


// action has payload and type

export const getBugs = (projectId) =>{
    return {
        type: GET_BUGS,
        payload: async () => {
            //const response = await fetch(`${SERVER}/bugs`)  // /projects/:pid/bugs  localhost:8080/projects/1/bugs
            const response = await fetch(`${SERVER}/projects/${projectId}/bugs`)
            const data = await response.json()
            return data;
        }
    }
}

export function addBug(projectId, bug) {
    return {
        type: ADD_BUG,
        payload: async () => {
            let response = await fetch(`${SERVER}/projects/${projectId}/bugs`, {  // let response = await fetch(`${SERVER}/users/${userId}/projects/${projectId}bugs`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bug)
            })
            response = await fetch(`${SERVER}/bugs`)
            const data = await response.json()
            return data
        }
    }
}

export function updateBug(bugId, bug) {
    return {
        type: UPDATE_BUG,
        payload: async () => {
            await fetch(`${SERVER}/bugs/${bugId}`, {    // await fetch(`${SERVER}/users/${userId}/projects/${projectId}/bugs/${bugId}`, {
                method: 'put',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bug)
            })
            let response = await fetch(`${SERVER}/bugs`)
            let json = await response.json()
            return json
        }
    }
}

export function deleteBug(bugId) {
    return {
        type: DELETE_BUG,
        payload: async () => {
            await fetch(`${SERVER}/bugs/${bugId}`, {    //            await fetch(`${SERVER}/bugs/${bugId}`, {
                method: 'delete'
            })
            let response = await fetch(`${SERVER}/bugs`)
            let json = await response.json()
            return json
        }
    }
}

