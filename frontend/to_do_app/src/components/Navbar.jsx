import {Link} from 'react-router';
import {PlusIcon, LogOut, User} from 'lucide-react';
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const { user, logout } = useUser();

  return (
    <header className='bg-base-300 border-b border-base-content/10'>
        <div className='mx-auto max-w-8xl p-4 bg-black'>
            <div className='flex items-center justify-between'>
                <h1 className='text-3xl font-extrabold tracking-normal text-orange-800'>FACE TO_DO</h1>
                <div className='flex items-center gap-5 bg-black '>
                    <div className='flex items-center gap-3 text-orange-800 '>
                        <User className='size-5'/>
                        <span className='font-medium'>{user?.name}</span>
                    </div>
                    <Link to={'/create'} className='btn btn-neutral rounded-full bg-orange-700 text-black hover:bg-orange-800'>
                        <PlusIcon className='size-5'/>
                        <span>New Task</span>
                    </Link>
                    <button 
                        onClick={logout}
                        className='btn btn-neutral rounded-full bg-orange-700 text-black hover:bg-orange-800'
                    >
                        <LogOut className='size-5'/>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    </header>
  );
};

export default Navbar
