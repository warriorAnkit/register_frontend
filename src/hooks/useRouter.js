import { useLocation, useNavigate, useParams } from 'react-router-dom';

// Custom hook for common routing operations
function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  return {
    location,
    params,
    navigate,
  };
}

export default useRouter;
