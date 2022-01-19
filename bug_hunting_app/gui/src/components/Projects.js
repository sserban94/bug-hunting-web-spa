import { useEffect, useState } from 'react'
import { useSelector, shallowEqual, useDispatch } from 'react-redux'    // shallow equal for change with replacement
import {projectActions} from '../actions'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { useAppContext } from "../lib/contextLib";
import "../containers/Login.css";

const projectListSelector = state => state.project.projectList

function Projects() {

  const [isDialogShown, setIsDialogShown] = useState(false)
  const [description, setDescription]=useState('');
  const [repository, setRepository]=useState('')

  // pt editare si salvare
  const [isNewProject, setIsNewProject] = useState(true)
  const [selected, setSelected] = useState(null)

  const projectList=useSelector(projectListSelector, shallowEqual)  //EROARE

  const dispatch = useDispatch()  //EROARE

  useEffect(() => {
    dispatch(projectActions.getProjects())
  }, [dispatch])  //EROARE

  const addNew=()=>{
    setIsDialogShown(true)
    setRepository('')
    setDescription('')
    setSelected(null)
    setIsNewProject(true)
  }

  const hideDialog = () => {
    setIsDialogShown(false)
  }

  const saveProject = () => {
    if (isNewProject) {
        dispatch(projectActions.addProject({ repository, description }))
    } else {
        dispatch(projectActions.updateProject(selected, { repository, description}))
    }
    setIsDialogShown(false)
    setRepository('')
    setDescription('')
    setSelected(null)
  }

  const tableFooter = (
    <div>
        {/* <Button label='Add project' icon='pi pi-plus' onClick={addNew} /> */}
    </div>
  )

  const addDialogFooter = (
    <div>
        <Button label='Send bug' icon='pi pi-save' onClick={saveProject} />
    </div>
  )

  const editProject = (rowData) => {
    setSelected(rowData.id)
    setRepository(rowData.repository)
    setDescription(rowData.description)
    setIsDialogShown(true)
    setIsNewProject(false)
  }

  const openProject = (rowData) => {
    //go to the route specified in App.js by the id of the project, meaning to <Project /> component
    setSelected(rowData.id)
    setRepository(rowData.repository)
    setDescription(rowData.description)
    setIsDialogShown(true)
    setIsNewProject(false)
  }

  const opsColumn = (rowData) => {    //dependant on current row
    return (
        <>
            <Button icon='pi pi-pencil' className='p-button-warning' onClick={() => openProject(rowData)}>Test app</Button>
        </>
    )
  }


  return (
      <>
        <h2 class="text1">Projects on this platform: </h2>
        <div>
            <DataTable value={projectList} footer={tableFooter}>
                <Column header='Repository' field='repository' />
                <Column header='Description' field='description' />
                <Column header='Team' field='members'/>
                <Column body={opsColumn} />
            </DataTable>
        </div>
       </>
    );
}

export default Projects;
