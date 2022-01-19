import {BrowserRouter, Routes, Route, Switch, useParams} from 'react-router-dom';
import { useEffect, useState } from 'react'
import { useSelector, shallowEqual, useDispatch } from 'react-redux'    // shallow equal for change with replacement

import { bugActions } from '../bug_actions'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'

const initialState={
    count:0,
    history: [0],
    subhomeTitle: 'My subtitle'
}

// const reducer=(state, action)=>{
//     switch(acti)
// }

const bugListSelector = state => state.bug.bugList


function Project() {
  
  const {id}=useParams();
  //ceva constanta care sa primeasca parametrii in functie de Id
 // const [state, dispatch]=useReducer(reducer, initialState);

 const [isDialogShown, setIsDialogShown] = useState(false)
 const [severity, setSeverity] = useState('')
 const [priority, setPriority] = useState('')
 const [description, setDescription] = useState('')
 const [status, setStatus] = useState('')
 const [commitLink, setCommitLink] = useState('')

 const [isNewBug, setIsNewBug] = useState(true)
 const [selected, setSelected] = useState(null)

 const bugList = useSelector(bugListSelector, shallowEqual)

 const dispatch = useDispatch()

 useEffect(() => {
    dispatch(bugActions.getBugs())
}, [dispatch])

const addNew = () => {
    setIsDialogShown(true)
    setSeverity('')
    setPriority('')
    setDescription('')
    setStatus('')
    setCommitLink(true)
}

const hideDialog = () => {
    setIsDialogShown(false)
}

const saveBug = () => {
    if (isNewBug) {
        dispatch(bugActions.addBug({ severity, priority, description, status }))    //statusul ar trebui sa aiba o valoare initiala 
    } else {
        dispatch(bugActions.updateBug(selected, { severity, priority, description, status }))
    }
    setIsDialogShown(false)
    setSeverity('')
    setPriority('')
    setDescription('')
    setStatus('pending')
    setSelected(null)
}

const tableFooter = (
    <div>
        <Button label='Add bug' icon='pi pi-plus' onClick={addNew} />
    </div>
)

const addDialogFooter = (
    <div>
        <Button label='Save bug' icon='pi pi-save' onClick={saveBug} />
    </div>
)

const deleteBug = (rowData) => {
    dispatch(bugActions.deleteBug(rowData.id))
}

const editBug = (rowData) => {
    //pot modifica doar statusul, la care obligatoriu adaug si linkul catre commit (in aceeasi secventa de text)
    setSelected(rowData.id)
    setSeverity(rowData.severity)
    setPriority(rowData.priority)
    setDescription(rowData.description)
    setStatus(rowData.status)
    setIsDialogShown(true)
    setIsNewBug(false)
}

const allocateBug=(rowData)=>{
    setStatus(rowData.status)
}
const opsColumn = (rowData) => {    //dependant on current row
    return (
        <>
            <Button onClick={() => allocateBug(rowData)}>Allocate</Button>
            <Button icon='pi pi-pencil' className='p-button-warning' onClick={() => editBug(rowData)} />
        </>
    )
}

  return (
    <>
    {/* valorile variabilelor trebuiesc primite prin request */}
        <p>Repository: {}</p>   
        <p>Description: {}</p>
        <p>Team members: {} </p>

        <h2 className='text1'>Reported bugs </h2>  
        <div>
            <DataTable value={bugList} footer={tableFooter}>
                <Column header='severity' field='severity' />
                <Column header='priority' field='priority' />
                <Column header='description' field='description' />
                <Column header='status' field='status' />
                <Column body={opsColumn} />
            </DataTable>
            {
                isDialogShown
                    ? (
                        <Dialog visible={isDialogShown} onHide={hideDialog} footer={addDialogFooter} header='A bug'>
                            <InputText onChange={(evt) => setSeverity(evt.target.value)} value={severity} name='severity' placeholder='severity' />
                            <InputText onChange={(evt) => setPriority(evt.target.value)} value={priority} name='priority' placeholder='priority' />
                            <InputText onChange={(evt) => setDescription(evt.target.value)} value={description} name='description' placeholder='description' />
                            <InputText onChange={(evt) => setStatus(evt.target.value)} value={status} name='status' placeholder='status (pending by default)' />
                        </Dialog>
                    ) : null
            }
        </div>   
    </>
  );
  
}

export default Project;