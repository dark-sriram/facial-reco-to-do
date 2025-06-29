import Navbar from '../components/Navbar';
import RateLimitedui from '../components/rateLimitedui.jsx';
import { useEffect } from 'react';
import { useState } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import NoteCard from '../components/NoteCard.jsx';
import NotesNotFound from '../components/NotesNotFound.jsx';

const HomePage = () => {
  const [isratelimited, setIsRateLimited] = useState(false);
  const [note, setnote] = useState([]);
  const [loading, setloading] = useState(true);
  
  useEffect(() => {
    const fetchNotes = async () => {
            try {
                const res = await api.get('/notes');
                console.log(res.data);
                setnote(res.data)
                setIsRateLimited(false); 
              } catch (error) {
                console.log('error fetching notes');
                console.log(error.response);
                if(error.response?.status === 429){
                  setIsRateLimited(true);
                }
                else{
                  toast.error("failed to load notes")
                }
              }
              finally{
                setloading(false);
              }
      };

        fetchNotes();
      }, []);

      return (
          <div className="min-h-screen">
              <Navbar />
      
              {isratelimited && <RateLimitedui />}

              <div className='max-w-7xl p-50 mt-6'>
                {loading && <div className=' text-center text-2xl text-orange-800 pl-60 pt-60 '>Loading Notes...</div>}

                {note.length === 0 && !isratelimited && <NotesNotFound/>}

                {note.length>0 && !isratelimited &&
                (<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-10'>
                  {note.map((notes)=>(
                    <NoteCard key={notes._id} notes={notes} setnote={setnote}/>
                  ))}
                </div>)
                }
              </div>
          </div>
      );

};

export default HomePage;
