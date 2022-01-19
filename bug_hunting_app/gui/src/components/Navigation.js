import { Navbar, Nav, Container } from 'react-bootstrap';
import React, { useState } from "react";

const Navigation=()=>{
  function logOut() {
    alert('you were logged out')
  }
    // const [isAuthenticated, userHasAuthenticated] = useState(false);
    // var state={ isLoggedIn: false }
    return(
        <>
{/* 
isAuthenticated ? (
  <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
) : (
  <>
    <LinkContainer to="/signup">
      <Nav.Link>Signup</Nav.Link>
    </LinkContainer>
    <LinkContainer to="/login">
      <Nav.Link>Login</Nav.Link>
    </LinkContainer>
  </>
) */}

            <Navbar collapseOnSelect fixed='top' expand='sm' bg='dark' variant='dark'>
                <Container>
                    <Navbar.Toggle aria-controls='responsive-navbar-nav' />
                    <Navbar.Collapse id='responsive-navbar-nav'>
                        <Nav.Link href='/'>Log In</Nav.Link>
                        <Nav.Link href='/myProjects'>My project</Nav.Link>
                        <Nav.Link href='/Projects'>Projects</Nav.Link>
                        <Nav.Link href='/logOut' onClick={logOut}>Log out</Nav.Link>
                    </Navbar.Collapse>
                </Container>

            </Navbar>
        </>
    );
}

export default Navigation;