import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const container = {
  initial: {},
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page auth-page">
      <div className="auth-backdrop" aria-hidden="true">
        <motion.span
          className="auth-orb auth-orb-brass"
          animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="auth-orb auth-orb-hedge"
          animate={{ y: [0, 16, 0], x: [0, -14, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      <div className="container">
        <motion.div
          className="form-card auth-card"
          variants={container}
          initial="initial"
          animate="animate"
        >
          <motion.span className="eyebrow" variants={item}>Welcome back</motion.span>
          <motion.h1 variants={item} style={{ marginBottom: 24, marginTop: 8 }}>Log in</motion.h1>

          {error && (
            <motion.div
              className="form-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.25 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={submit}>
            <motion.div className="field" variants={item}>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required value={form.email}
                     onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </motion.div>
            <motion.div className="field" variants={item}>
              <label htmlFor="password">Password</label>
              <input id="password" type="password" required value={form.password}
                     onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </motion.div>
            <motion.div variants={item}>
              <motion.button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={submitting}
                whileHover={{ scale: submitting ? 1 : 1.015 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
              >
                {submitting ? 'Logging in\u2026' : 'Log in'}
              </motion.button>
            </motion.div>
          </form>

          <motion.p className="text-muted" variants={item} style={{ marginTop: 20, fontSize: '0.85rem' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--brass-dark)', fontWeight: 600 }}>Sign up</Link>
          </motion.p>
          <motion.p className="text-muted mono" variants={item} style={{ marginTop: 14, fontSize: '0.76rem' }}>
            Demo: agent@demo.com / password123
          </motion.p>
        </motion.div>
      </div>
    </main>
  );
}
