import { SERVER } from '../config/global'

export const GET_ACCOUNTS = 'GET_ACCOUNTS'
export const ADD_ACCOUNT = 'ADD_ACCOUNT'
export const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT'
export const DELETE_ACCOUNT = 'DELETE_ACCOUNT'

export function getAccounts() {
    return {
        type: GET_ACCOUNTS,
        payload: async () => {
            const response = await fetch(`${SERVER}/accounts`)
            const data = await response.json()
            return data;
        }
    }
}

export function addAccount(account) {
    return {
        type: ADD_ACCOUNT,
        payload: async () => {
            let response = await fetch(`${SERVER}/accounts`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(account)
            })
            response = await fetch(`${SERVER}/accounts`)
            const data = await response.json()
            return data
        }
    }
}

export function updateAccount(accountId, account) {
    return {
        type: UPDATE_ACCOUNT,
        payload: async () => {
            await fetch(`${SERVER}/accounts/${accountId}`, {
                method: 'put',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(account)
            })
            let response = await fetch(`${SERVER}/account`)
            let json = await response.json()
            return json
        }
    }
}

export function deleteAccount(accountId) {
    return {
        type: DELETE_ACCOUNT,
        payload: async () => {
            await fetch(`${SERVER}/account/${accountId}`, {
                method: 'delete'
            })
            let response = await fetch(`${SERVER}/accounts`)
            let json = await response.json()
            return json
        }
    }
}
