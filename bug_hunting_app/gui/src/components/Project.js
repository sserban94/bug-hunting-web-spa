import {BrowserRouter, Routes, Route, Switch, useParams, useNavigate} from 'react-router-dom';
import { useEffect, useState } from 'react'
import { useSelector, shallowEqual, useDispatch } from 'react-redux'    // shallow equal for change with replacement

import { bugActions } from '../bug_actions'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import useFetch from './useFetch';


const bugListSelector = state => state.bug.bugList


function Project() {
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
    dispatch(bugActions.getBugs(id))
}, [dispatch])

const addNew = () => {
    setIsDialogShown(true)
    setSeverity('')
    setPriority('')
    setDescription('')
    setStatus('')
   // setCommitLink(true)
    setIsNewBug(true)
}

const hideDialog = () => {
    setIsDialogShown(false)
}

const saveBug = () => {
    if (isNewBug) {
        dispatch(bugActions.addBug(id, { severity, priority, description, status }))    //statusul ar trebui sa aiba o valoare initiala 
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
        <Button label='Add bug (TST)' icon='pi pi-plus' onClick={addNew} />
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


const {id} =useParams();
const {data: project, error, isPending}=useFetch(`http://localhost:8080/projects/${id}`) //pt a obtine descrierea proiectului, folosesc un CUSTOM HOOK, cu link catre baza de date
const navigate =useNavigate();

  return (
    <>
   <h2 className='text1'>Project detailes: </h2>  
    <div>
        {isPending && <div> Loading ... </div>}
        {error && <div>{error}</div>}
        {project && (
                <article>
                    <h2>Repository: {project.repository}</h2>
                    <h2>Description: {project.description}</h2>
                    {/* <h2> Team members: {project.members}</h2> */}
                    {/* <div>Body: {article.body}</div> */}
                </article>
        )}
      </div>
        {/* <p>Repository: {}</p>   
        <p>Description: {}</p>
        <p>Team members: {} </p> */}

        <h2 className='text1'>Reported bugs: </h2>  
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
        <Button label='go back' onClick={()=>navigate(-1)} />
    </>
  );
  
}

export default Project;