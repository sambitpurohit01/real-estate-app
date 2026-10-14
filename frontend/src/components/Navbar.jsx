import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resolveImageUrl } from '../utils/format';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '';

  return (
    <header className="navbar">
      <div className="container">
        <Link to="/" className="brand">
          Keystone<span className="brand-mark">.</span>
        </Link>

        <nav className="nav-links">
          <Link to="/" className={isActive('/')}>
            <span className="link-text">Listings</span>
          </Link>
          {user && (
            <>
              <Link to="/my-listings" className={isActive('/my-listings')}>
                <span className="link-text">My Listings</span>
              </Link>
              <Link to="/favorites" className={isActive('/favorites')}>
                <span className="link-text">Saved</span>
              </Link>
              <Link to="/messages" className={isActive('/messages')}>
                <span className="link-text">Messages</span>
              </Link>
              <Link to="/properties/new" className="btn btn-brass btn-sm">
                + New Listing
              </Link>
            </>
          )}
        </nav>

        <div className="nav-user">
          {user ? (
            <>
              <Link to="/profile" title="Edit profile">
                {user.avatarUrl ? (
                  <img className="nav-avatar-img" src={resolveImageUrl(user.avatarUrl)} alt={user.fullName} />
                ) : (
                  <div className="nav-avatar">{initials}</div>
                )}
              </Link>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
