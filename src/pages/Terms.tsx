import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const Terms = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    setAccepting(true);
    setError('');
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ terms_accepted: true })
      .eq('id', user.id);
    setAccepting(false);
    if (error) {
      setError('Failed to accept terms. Please try again.');
    } else {
      navigate('/club-portal', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full bg-white rounded shadow p-8">
        <h1 className="text-2xl font-bold mb-4">Terms and Conditions</h1>
        <div className="mb-6 text-gray-700 space-y-2">
          <p>Welcome to BearBites! Before you can use the club portal, you must agree to the following terms:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You will only post legitimate food alerts for UC Berkeley events.</li>
            <li>No spam, inappropriate, or misleading content is allowed.</li>
            <li>You are responsible for the accuracy of the information you post.</li>
            <li>BearBites reserves the right to remove any content or restrict access at any time.</li>
          </ul>
          <p>By clicking "I Accept", you agree to abide by these terms and conditions.</p>
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <Button onClick={handleAccept} disabled={accepting} className="w-full bg-blue-600 hover:bg-blue-700">
          {accepting ? 'Accepting...' : 'I Accept'}
        </Button>
      </div>
    </div>
  );
};

export default Terms;
