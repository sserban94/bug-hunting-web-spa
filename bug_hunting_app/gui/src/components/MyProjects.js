import {BrowserRouter, Routes, Route} from 'react-router-dom';
import LogIn from './LogIn';
import React, { useState } from "react";
import { useAppContext } from "../lib/contextLib";
import { Button, FormGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from "react-bootstrap/Form";
import { Alert } from 'react-alert'
import "../containers/Login.css";
import Project from './Project';


export default function MyProject(props) {
 const {onAdd} = props;
 const [description, setDescription]=useState('');
 const [member, setMember]=useState('')
 const [repository, setRepository]=useState('')
 const members=[]
 const add=(evt)=>{
   onAdd({
     description,
     member,
     repository
   })
   setDescription('')
   setMember('')
   setRepository('')
 }

  function addProjToDb(){
    //ma adauga pe mine, cel conencat, ca membru al echipei
    //da permisiuni de insusire bug tuturor membrilor
    //functie pt salvarea in baza de date a unui proiect ce contine description, members si repository
  }

  function addMember(){
    if(members.includes(member))
      alert('the member is already added')
    else{
      members.push(member)
      alert('member '+member+' added');
    }
  }

  function validateMember() {
    return member.length > 0; //checks if our fields are non-empty, but can easily do something more complicated.
  }

  function validateForm() {
    return description.length > 0; //checks if our fields are non-empty, but can easily do something more complicated.
  }

  async function handleSubmit(event) {
    console.log('You clicked submit.');
    event.preventDefault(); //trigger our callback handleSubmit when the form is submitted. For now we are simply suppressing the browser’s default behavior on submit but we’ll do more here later.
  }

  return (
      <>
          <h2 class="text1">My and my team's project:</h2>
          <Project/>

          <hr></hr>
          <h2 className='text1'>Add a project (or change the registered one)</h2>  
        <Form  className="loginButton">

        <Form.Group size="lg" controlId="description">
          <Form.Label>Project repository</Form.Label>
          <Form.Control
            type="text"
            value={repository}
            onChange={(e) => setRepository(e.target.value)}
          />
        </Form.Group>

        <Form.Group size="lg" controlId="description">
          <Form.Label>Project description</Form.Label>
          <Form.Control id="inputPassword"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>

        <Form.Group size="lg" controlId="email">

          <Form>
            <FormGroup>
              <Form.Label>Team members (add them one by one)</Form.Label>
              <Form.Control id="inputEmail" 
                autoFocus       //We are setting the autoFocus flag for our email field, so that when our form loads, it sets focus to this field.
                type="email"
                value={member}
                onChange={(e) => setMember(e.target.value)}
              />
              <Button onClick={addMember}  className="loginButton" block size="md"  disabled={!validateMember()}>Add team member</Button>
            
            </FormGroup>
          </Form>
          {/* 
          <Form.Label>Team members (add them one by one)</Form.Label>
          <Form.Control id="inputEmail" 
            autoFocus       //We are setting the autoFocus flag for our email field, so that when our form loads, it sets focus to this field.
            type="email"
            value={member}
            onChange={(e) => setMember(e.target.value)}
          />
          <Button onClick={addMember} className="loginButton" block size="md"  disabled={!validateMember()}>Add team member</Button>
           */}
        </Form.Group>
        <Button id="buttonM"  onClick={addProjToDb} className="loginButton" block size="lg" type="submit" disabled={!validateForm()} >
          Add the project
        </Button>
      </Form> 
      </>
    );
}


