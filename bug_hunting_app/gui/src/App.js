import {BrowserRouter, Routes, Route, Switch} from 'react-router-dom';
import LogIn from './components/LogIn';
import Projects from './components/Projects';
import MyProjects from './components/MyProjects';
import { AppContext } from "./lib/contextLib";
import Navigation from './components/Navigation';
import Project from './components/Project';

function App() {

  return (
   <>
    <Navigation/>
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<LogIn />}/>
        <Route path="projects" element = {<Projects />}/>
        <Route path="myProjects" element = {<MyProjects />}/>
        <Route path="projects/:id" element = {<Project />}/>
        <Route path="Projects/projects/:id" element = {<Project />}/>
        {/* /users/:uid/projects/:pid/bugs */}
        {/* /projects/:pid/bugs */}
        <Route path="bug" element = {<Project />}/>
        <Route path="logout" element = {<LogIn />}/>
      </Routes>
      
     </BrowserRouter>
     </>
  );
  
}

export default App;
