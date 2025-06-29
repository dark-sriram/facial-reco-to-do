import {Link} from 'react-router';
import {PlusIcon} from 'lucide-react';

const Navbar = () => {
  return (
    <header className='bg-base-300 border-b border-base-content/10'>
        <div className='mx-auto max-w-8xl p-4 bg-black'>
            <div className='flex items-center justify-between'>
                <h1 className='text-4xl font-extrabold tracking-tighter text-orange-800'>NOTES MAKER</h1>
                <div className='flex items-center gap-4 bg-black'>
                    <Link to={'/create'} className='btn btn-neutral bg-orange-800 text-black '>
                    <PlusIcon className='size-5'/>
                    <span>new note</span>
                    </Link>
                </div>
            </div>
        </div>
    </header>
  );
};

export default Navbar
