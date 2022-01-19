import { SERVER } from '../config/global'

export const GET_PROJECTS = 'GET_PROJECTS'
export const ADD_PROJECT = 'ADD_PROJECT'
export const UPDATE_PROJECT = 'UPDATE_PROJECT'
export const DELETE_PROJECT = 'DELETE_PROJECT'


// action has payload and type

export function getProjects() {
    return {
        type: GET_PROJECTS,
        payload: async () => {
            const response = await fetch(`${SERVER}/projects`)
            const data = await response.json()
            return data;
        }
    }
}

// I need an User ID here
export function addProject(project) {
    return {
        type: ADD_PROJECT,
        payload: async () => {
            let response = await fetch(`${SERVER}users/${userId}/projects`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(project)
            })
            response = await fetch(`${SERVER}users/${userId}/projects`)
            const data = await response.json()
            return data
        }
    }
}
// need user Id as well
export function updateProject(projectId, project) {
    return {
        type: UPDATE_PROJECT,
        payload: async () => {
            await fetch(`${SERVER}users/${userId}/projects/${projectId}`, {
                method: 'put',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(project)
            })
            let response = await fetch(`${SERVER}/projects`)
            let json = await response.json()
            return json
        }
    }
}
// TODO need user id or should use token to search in db?
export function deleteProject(projectId) {
    return {
        type: DELETE_PROJECT,
        payload: async () => {
            await fetch(`${SERVER}users/${userId}/projects/${projectId}`, {
                method: 'delete'
            })
            let response = await fetch(`${SERVER}/projects`)
            let json = await response.json()
            return json
        }
    }
}

