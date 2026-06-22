import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) setFieldErrors(data.errors);
      setError(data?.message || err.friendlyMessage || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Start tracking your sales pipeline</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
            {fieldErrors.length > 0 && (
              <ul className="mt-1 list-inside list-disc">
                {fieldErrors.map((fe) => (
                  <li key={fe.field}>{fe.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="input"
              value={form.name}
              onChange={onChange}
              placeholder="Jane Doe"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              value={form.password}
              onChange={onChange}
              placeholder="At least 6 characters"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
