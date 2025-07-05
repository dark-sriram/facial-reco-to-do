import Navbar from '../components/Navbar';
import RateLimitedui from '../components/rateLimitedui.jsx';
import { useEffect } from 'react';
import { useState } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import NoteCard from '../components/NoteCard.jsx';
import NotesNotFound from '../components/NotesNotFound.jsx';
import { useUser } from '../context/UserContext';

const HomePage = () => {
  const { user } = useUser();
  const [isratelimited, setIsRateLimited] = useState(false);
  const [note, setnote] = useState([]);
  const [loading, setloading] = useState(true);
  
  // Debug logging
  console.log('HomePage - Current user:', user);
  console.log('HomePage - User ID:', user?.id);
  
  useEffect(() => {
    const fetchNotes = async () => {
            try {
                console.log('Fetching notes for user:', user.id);
                const res = await api.get(`/notes?userId=${user.id}`);
                console.log('Notes fetched:', res.data);
                setnote(res.data);
                setIsRateLimited(false); 
              } catch (error) {
                console.error('Error fetching notes:', error);
                if(error.response?.status === 429){
                  setIsRateLimited(true);
                  toast.error("Too many requests. Please wait a moment.");
                }
                else{
                  toast.error("Failed to load tasks. Please try again.");
                }
              }
              finally{
                setloading(false);
              }
      };

        if (user?.id) {
            fetchNotes();
        } else {
            console.log('No user ID available');
            setloading(false);
        }
      }, [user]);


      return (
          <div className="min-h-screen">
              <Navbar />
      
              {isratelimited && <RateLimitedui />}
              

              <div className='max-w-7xl rounded-xl mx-auto p-6 mt-6 '>
                {loading && (
                  <div className='text-cente text-2xl text-orange-900 py-20 '>
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="mt-4">Loading your tasks...</p>
                  </div>
                )}

                {!loading && note.length === 0 && !isratelimited && <NotesNotFound/>}

                {!loading && note.length > 0 && !isratelimited && (
                  <div className='grid  rounded-xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {note.map((notes) => (
                      <NoteCard key={notes._id} notes={notes} setnote={setnote}/>
                    ))}
                  </div>
                )}
              </div>
          </div>
      );

};

export default HomePage;
