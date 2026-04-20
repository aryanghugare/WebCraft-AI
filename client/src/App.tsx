import React from 'react';
import { Routes , Route , useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Projects from './pages/Projects';
import MyProjects from './pages/MyProjects';
import Preview from './pages/Preview';
import Community from './pages/Community';
import View from './pages/View';

import Loading from './components/LoaderSteps';
import Navbar from './components/Navbar';

function App() {


  const { pathname } = useLocation()

  const hideNavbar = pathname.startsWith('/projects/') && pathname !== '/projects'
                      || pathname.startsWith('/view/')
                      || pathname.startsWith('/preview/')
  return (
    <div >

  {!hideNavbar && <Navbar />}
<Routes>
<Route path='/' element={<Home />} />
        <Route path='/pricing' element={<Pricing />} />
        <Route path='/projects/:projectId' element={<Projects />} />
        <Route path='/projects' element={<MyProjects />} />
        <Route path='/preview/:projectId' element={<Preview />} />
        <Route path='/preview/:projectId/:versionId' element={<Preview />} />
        <Route path='/community' element={<Community />} />
        <Route path='/view/:projectId' element={<View />} />

        <Route path='/loading' element={<Loading />}/>
</Routes>

</div>
  )
}

export default App