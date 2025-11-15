import { Link, useLocation } from 'react-router-dom';
import { Heart, Users, Home } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/guests', label: 'Guests', icon: Users },
  ];

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <Heart className="h-6 w-6" fill="currentColor" />
            <span className="text-xl font-semibold">Wedding Manager</span>
          </Link>
          
          <div className="flex gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === to
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
