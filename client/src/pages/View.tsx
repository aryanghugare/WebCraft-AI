import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { dummyProjects } from '../assets/assets';
import { Loader2Icon } from 'lucide-react';
import type { Project } from '../types';
import ProjectPreview from '../components/ProjectPreview';
import { toast } from 'sonner';
import api from '@/configs/axios';

const View = () => {

const {projectId} = useParams() ;
const [code,setCode] = useState("") ;
const [loading, setLoading] = useState(true)

// function to fetch 
const fetchCode = async () => {
try {

  const code = dummyProjects.find((project) => project.id === projectId)?.current_code;
  if (code) {
    setCode(code);
    setLoading(false);
  }
  else {
    const { data } = await api.get(`/api/project/published/${projectId}`);
    if (data) setCode(data.code)
  }

      setLoading(false)
      
        
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log("Error while fetching the code" ,error);
    }
}


// fetching the code at mounting 
useEffect(()=>{
fetchCode() 
},[])

 if(loading){
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2Icon className='size-7 animate-spin text-indigo-200' />
      </div>
    )
  }

  return (
    <div className="h-screen">
      {code && <ProjectPreview project={{current_code: code} as Project} isGenerating={false} showEditorPanel={false}/>}
    </div>
  )
}

export default View