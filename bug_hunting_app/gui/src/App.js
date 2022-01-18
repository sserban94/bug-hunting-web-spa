import {BrowserRouter, Routes, Route} from 'react-router-dom';
import LogIn from './components/LogIn';
import React, { useState } from "react";
import { AppContext } from "./lib/contextLib";

function App() {
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  return (
   <> 
   {/* {isAuthenticated ? (
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
)} */}
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogIn />}/>
        {/* <AppContext.Provider value={{ isAuthenticated, userHasAuthenticated }}>
  
      </AppContext.Provider> */}

      </Routes>
      
     </BrowserRouter>
     </>
  );
  
}

export default App;
