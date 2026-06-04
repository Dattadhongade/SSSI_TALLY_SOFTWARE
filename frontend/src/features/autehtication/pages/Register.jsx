import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus } from 'lucide-react';
import useStore from '../../../store/useStore';
import Swal from 'sweetalert2';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });
  const navigate = useNavigate();
  const login = useStore((state) => state.login);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      login(res.data.user, res.data.token);
      
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: 'Welcome to SSSI ERP!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      navigate('/select-company');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: err.response?.data?.message || 'Please check your inputs'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-tally-light-blue font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 border border-tally-border shadow-lg">
        <div>
          <div className="mx-auto h-12 w-12 bg-tally-bg rounded-full flex items-center justify-center border border-tally-border">
            <UserPlus className="h-6 w-6 text-tally-blue" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-tally-blue">
            SSSI ERP Registration
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-3">
            <div>
              <label className="text-xs font-semibold text-tally-dark">Full Name</label>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-tally-border bg-[#fcf8e3] text-gray-900 focus:outline-none focus:ring-tally-blue focus:border-tally-blue focus:z-10 sm:text-sm"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-tally-dark">Email Address</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-tally-border bg-[#fcf8e3] text-gray-900 focus:outline-none focus:ring-tally-blue focus:border-tally-blue focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-tally-dark">Mobile No.</label>
              <input
                name="mobile"
                type="text"
                required
                value={formData.mobile}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-tally-border bg-[#fcf8e3] text-gray-900 focus:outline-none focus:ring-tally-blue focus:border-tally-blue focus:z-10 sm:text-sm"
                placeholder="Mobile number"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-tally-dark">Password</label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-tally-border bg-[#fcf8e3] text-gray-900 focus:outline-none focus:ring-tally-blue focus:border-tally-blue focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-tally-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tally-blue transition-colors"
            >
              Register (Ctrl+A)
            </button>
          </div>
        </form>
        
        <div className="text-center pt-4 border-t border-tally-border">
          <Link to="/login" className="font-medium text-tally-blue hover:underline text-sm">
            Already have an account? Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
