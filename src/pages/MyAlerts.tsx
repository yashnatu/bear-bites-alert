import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface FoodAlert {
  id: string;
  food_type: string;
  quantity: string;
  building: string;
  room: string;
  expires_at: string;
  created_at: string;
}

export default function MyAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<FoodAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ terms_accepted: boolean } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      // Fetch profile to check terms acceptance
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('terms_accepted')
        .eq('id', user.id)
        .single();
      
      if (!profileError) {
        setProfile(profileData);
      }

      // Fetch alerts
      const { data, error } = await supabase
        .from('food_alerts')
        .select('*')
        .eq('club_id', user.id)
        .order('created_at', { ascending: false });
      if (!error) setAlerts(data || []);
      setLoading(false);
    };
    
    fetchData();
  }, [user]);

  if (!user) return <div className="p-8 text-center">Please sign in to view your food alerts.</div>;
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  
  // Redirect to terms if not accepted
  if (profile && !profile.terms_accepted) {
    navigate('/terms?redirect=%2Fmy-alerts');
    return <div className="p-8 text-center">Redirecting to terms...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Home
        </button>
        <div className="flex-1 flex justify-center">
          <h1 className="text-2xl font-bold">My Food Alerts</h1>
        </div>
        <div className="w-32" /> {/* Spacer to balance the left button */}
      </div>
      {alerts.length === 0 ? (
        <Card className="p-8 text-center">You have not posted any food alerts yet.</Card>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border">
          <table className="min-w-full text-sm bg-white rounded-lg">
            <thead className="bg-blue-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 border-b font-semibold text-left">Date Posted</th>
                <th className="px-4 py-3 border-b font-semibold text-left">Food Type</th>
                <th className="px-4 py-3 border-b font-semibold text-left">Location</th>
                <th className="px-4 py-3 border-b font-semibold text-left">Quantity</th>
                <th className="px-4 py-3 border-b font-semibold text-left">Expires At</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, i) => (
                <tr key={alert.id} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50/50'}>
                  <td className="px-4 py-2 border-b">{new Date(alert.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 border-b">{alert.food_type}</td>
                  <td className="px-4 py-2 border-b">{alert.building}, Room {alert.room}</td>
                  <td className="px-4 py-2 border-b">{alert.quantity}</td>
                  <td className="px-4 py-2 border-b">{new Date(alert.expires_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
