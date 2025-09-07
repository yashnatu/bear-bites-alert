import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-red-600">Access Denied</h1>
        <p className="text-xl text-gray-700 mb-4">
          You must sign in with a <span className="font-mono">@berkeley.edu</span> Google account to access this portal.
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
