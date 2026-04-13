import React from 'react';
import { Routes , Route } from 'react-router-dom';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Projects from './pages/Projects';
import MyProjects from './pages/MyProjects';
import Preview from './pages/Preview';
import Community from './pages/Community';
import View from './pages/View';

import Loading from './components/LoaderSteps';

function App() {
  return (
    <div className='bg-gray-500 p-4 rounded-lg shadow-md text-amber-200'  >
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