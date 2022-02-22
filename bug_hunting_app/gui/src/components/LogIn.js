import React, { useEffect, useState } from "react";
import { useSelector, shallowEqual, useDispatch } from 'react-redux'    // shallow equal for change with replacement

import 'bootstrap/dist/css/bootstrap.min.css';
import Form from "react-bootstrap/Form";
import { Alert } from 'react-alert'
import "react-notifications/lib/notifications.css";
import {NotificationContainer, NotificationManager} from "react-notifications";

import Button from "react-bootstrap/Button";
import { Navbar, Nav, Container } from 'react-bootstrap';

import "../containers/Login.css";
import { useAppContext } from "../lib/contextLib";
import Projects from "./Projects";

import { NavLink } from 'react-router-dom'
import { accountActions} from '../account_actions'


{/* <link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
  integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
  crossorigin="anonymous"
/> */}
// import { Auth } from "aws-amplify";
// import { useNavigate } from 'react-router-dom';

const accountListSelector = state => state.account.accountList
export default function Login() {
  //  const { userHasAuthenticated } = useAppContext();
  //const navigate = useNavigate();
  // const history = useHistory();

  const [email, setEmail] = useState("");//useState hook just gives you the current value of the variable you want to store
  const [password, setPassword] = useState("");

  const [isNewAccount, setIsNewAccount] = useState(true)
  const [selected, setSelected] = useState(null)

  const accountList=useSelector(accountListSelector, shallowEqual)
  const dispatch = useDispatch()  //EROARE


  useEffect(() => {
    dispatch(accountActions.getAccounts())
  }, [dispatch])  //EROARE

  const addNew=()=>{
    //setIsDialogShown(true)
    setEmail('')
    setPassword('')
   // setSelected(null)
    setIsNewAccount(true)
  }

  const saveAccount = () => {
    if (isNewAccount) {
        dispatch(accountActions.addAccount({ email, password }))
     alert ('hello '+email)
    } else   alert('the account already exists');
    // else {
    //     dispatch(accountActions.updateAccount(selected, { email, password}))
    // }
    //setIsDialogShown(false)
    setEmail('')
    setPassword('')
    setSelected(null)
  }

  // const openAccount = (rowData) => {
  //   //go to the route specified in App.js by the id of the project, meaning to <Project /> component
  //   setSelected(rowData.id)
  //   setRepository(rowData.repository)
  //   setDescription(rowData.description)
  //   setIsDialogShown(true)
  //   setIsNewProject(false)
  // }

  function validateForm() {
    return email.length > 0 && password.length > 0; //checks if our fields are non-empty, but can easily do something more complicated.
  }
  

  // function isMember(){
  //     //if (contul - compus din variablelel email si password - se gaseste in baza de date)
  //      // return 1;

  //       //urmatoarele doua linii sunt doar un exemplu de comportament pentru 3 conturi considerate valide:
  //     if(email==="visanlarisa19@stud.ase.ro" || email==="scorteanuserban19@stud.ase.ro" ||email==="vaidescudan19@stud.ase.ro")    //aic ar trebui de fapt sa verificam daca aceste conturi si parolele lor se afla in baza de date
  //        return 1;

  //     alert("you are not a member of any team")
  //     return 0 ;  
  // }

  function logIn(){
    console.log('log in pressed')
    if(!(isNewAccount()))
      {
        alert("wellcome! BUT YOU DIDN'T GET THE PERMISSIONS YET");
        //redirectionez catre MyProjects
        //ofer permisiuni
      }
    else alert('no account with this email; please create one')
  }

  // function createMember(){
  //  //if (isMember())
  //    if(email==="visanlarisa19@stud.ase.ro" || email==="scorteanuserban19@stud.ase.ro" ||email==="vaidescudan19@stud.ase.ro") //liniile astea trebuiesc clar inlocuite relativ la baza de date
  //     alert('The email address you entered already belongs to an account. Please log in or use a new address to create a an account.')
   
  // //else 
  // //{introduc noul cont in baza de date (format din email si password)
  //   //alert('the account was created')
  //   //acord permisiuni (utilizatorul este logat automat)
  // //}
  // }

  async function handleSubmit(event) {
    console.log('You clicked submit.');
    event.preventDefault(); //trigger our callback handleSubmit when the form is submitted. For now we are simply suppressing the browser’s default behavior on submit but we’ll do more here later.
    // history.push(`/dashboard`);
    // try {
    //   await Auth.signIn(email, password);
    //   userHasAuthenticated(true);
    //   history.push("/");
    // } catch (e) {
    //   alert(e.message);
    // }
  }

//setEmail and setPassword functions to store what the user types in — e.target.value. Once we set the new state, our component gets re-rendered. The variables email and password now have the new values.
  return (
    <div className="Login">
        <h2 class="text1">Wellcome to Bug Hunting App!</h2>
        <h4 class="text2"> Below you have a form that you may complete in order to sign in as a tester of some members teams' projects, to log in and see your project's status, or to create an account for being able to load your team's project</h4>

      <Form onSubmit={handleSubmit} className="loginButton">
        <Form.Group size="lg" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control id="inputEmail"
            autoFocus       //We are setting the autoFocus flag for our email field, so that when our form loads, it sets focus to this field.
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group size="lg" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control id="inputPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>


        <Button id="buttonM" onClick={logIn} className="loginButton" block size="lg" type="submit" disabled={!validateForm()} >
          Login (PM)
        </Button>

        {/* <Button onclick={<Projects />} block size="lg" className="loginButton" disabled={!validateForm()}>
          Navigate as tester of the loaded projects (TST)
        </Button> */}
        {/* <h3>aici am o problema pt ca, pt a fi tester, fie sunt obligat sa am acelasi tip de cont, doar ca le testez pe ale altcuiva (ceea ce ar putea implica modificari de ideologie in ce priveste planul initial referitor la permisiuni), fie navighez doar pe baza de email, insa astfel nu stiu cum pot sa asigur aplicatia ca nu folosesc mailul altcuiva</h3> */}
        <Button onClick={addNew, saveAccount} className="loginButton" block size="lg" type="submit" disabled={!validateForm()} >
          Create account (PM)
        </Button>
      </Form>    
    </div>
  );
}
