import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from "react-bootstrap/Form";

import { Alert } from 'react-alert'
import "react-notifications/lib/notifications.css";
import {NotificationContainer, NotificationManager} from "react-notifications";

import Button from "react-bootstrap/Button";
import "../containers/Login.css";


import { useAppContext } from "../lib/contextLib";

//import { Auth } from "aws-amplify";

export default function CreateAccount() {
  //  const { userHasAuthenticated } = useAppContext();

  function sayHello() {
    alert('Hello!');
  }

  const [email, setEmail] = useState("");//useState hook just gives you the current value of the variable you want to store
  const [password, setPassword] = useState("");

  function validateForm() {
    return email.length > 0 && password.length > 0; //checks if our fields are non-empty, but can easily do something more complicated.
  }

    function isMember(){
      NotificationManager.success("hello", "", 1000)
      var i=1, m=0;
      if(email==="visanlarisa19@stud.ase.ro")
          m=1;
      if (!(email.length > 0 && password.length > 0))
          i=0;
      if(i==0)
          alert('not a correct email address')
      if(m==0)
          alert('not a member') 
      if(m==1 && i==1)
      {
        alert('hello, member!')
        return 1;
      }
      return 0 ;  
  }

  function showNotification(){    
    console.log("hello, baa")
    NotificationManager.success("copied");

  };

  function handleSubmit(event) {
    console.log('You clicked submit.');
    event.preventDefault(); //trigger our callback handleSubmit when the form is submitted. For now we are simply suppressing the browser’s default behavior on submit but we’ll do more here later.
  }

//setEmail and setPassword functions to store what the user types in — e.target.value. Once we set the new state, our component gets re-rendered. The variables email and password now have the new values.
  return (
    <div className="Login">
        
      <Form onSubmit={handleSubmit}>
        <Form.Group size="lg" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            autoFocus       //We are setting the autoFocus flag for our email field, so that when our form loads, it sets focus to this field.
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group size="lg" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button id="buttonM"  onClick={isMember} className="loginButton" block size="lg" type="submit" disabled={!validateForm()} >
          Login as team member
        </Button>
        <Button block size="lg" className="loginButton" disabled={!validateForm()}>
          Login as tester
        </Button>
      </Form>
        
        
    </div>
  );
}

// export default LogIn;