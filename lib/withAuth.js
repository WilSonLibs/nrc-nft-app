import { useAuth } from './AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const withAuth = (Component) => {
  return function ProtectedRoute(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login');
      }
    }, [user, loading]);

    if (loading || !user) {
      return <p className="p-4">Checking authentication...</p>;
    }

    return <Component {...props} />;
  };
};

export default withAuth;
