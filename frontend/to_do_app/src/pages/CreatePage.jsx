import { useState } from 'react';
import { Link, useNavigate} from 'react-router';
import {ArrowLeftIcon, Calendar, Flag} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useUser } from '../context/UserContext';

const createPage = () => {
    const { user } = useUser();
    const [title, settitle] = useState('');
    const [content, setcontent] = useState('');
    const [priority, setPriority] = useState('medium');
    const [dueDate, setDueDate] = useState('');
    const [loading, setloading] = useState(false);

    const navigate = useNavigate();

    const handeleSubmit = async(e) => {
        e.preventDefault();
        if(!title.trim() || !content.trim()){
          toast.error("Title and content are required");
          return;
        }
        setloading(true)
        try {
          await api.post("/notes", {
            title,
            content,
            userId: user.id,
            priority,
            dueDate: dueDate || null,
          })
          toast.success("Task created successfully!"); 
          navigate("/")
        } catch (error) {
          console.error(error)
          if (error.response?.status === 429) {
            toast.error("Slow down! You're creating tasks too fast", {
              duration: 4000,
              icon: "💀",
            });
          } else {
            toast.error("Failed to create task");
          }
          }finally {
          setloading(false);
        }
      }
    


    return <div className='min-h-screen'>
      <div className='container mx-auto px-4 py-8 pt-50'>
        <div className='max-w-2xl mx-auto '>
          <Link to={"/"} className='btn btn-ghost text-white mb-6 bg-black '>
            <ArrowLeftIcon className='size-5'/>
            back to home
          </Link>

          <div className='card bg-black shadow-xl rounded-lg'>
            <div className='card-body'>
              <h2 className='card-title text-3xl  text-white  mb-4'>Create New Task</h2>
              <form onSubmit={handeleSubmit}>
                <div className='form-control mb-4'>
                  <label className='label'>
                    <span className='label-text text-xl text-white'>Task Title</span>
                  </label>
                  <input type="text"
                  placeholder='Enter task title'
                  className='input input-bordered text-white'
                  value={title}
                  onChange={(e)=>settitle(e.target.value)}
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text text-white">Description</span>
                  </label>
                  <textarea
                    placeholder="Describe your task..."
                    className="textarea textarea-bordered h-32 text-white"
                    value={content}
                    onChange={(e) => setcontent(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-white flex items-center gap-2">
                        <Flag className="size-4" />
                        Priority
                      </span>
                    </label>
                    <select 
                      className="select text-white select-bordered"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-white flex items-center gap-2">
                        <Calendar className="size-4 text-white" />
                        Due Date (Optional)
                      </span>
                    </label>
                    <input 
                      type="date"
                      className="input text-white input-bordered"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="card-actions justify-end">
                  <button type="submit" className="btn btn-orange-800 hover:bg-black text-white" disabled={loading}>
                    {loading ? "Creating..." : "Create Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  
};

export default createPage;
