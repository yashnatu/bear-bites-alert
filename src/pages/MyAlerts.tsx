import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader title="My Food Alerts" showBackButton={true} />
      <div className="max-w-4xl mx-auto p-8">
      {alerts.length === 0 ? (
        <Card className="p-8 text-center text-gray-900 dark:text-gray-100">
          You have not posted any food alerts yet.
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm bg-white dark:bg-gray-800 rounded-lg">
            <thead className="bg-blue-50 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 font-semibold text-left text-gray-900 dark:text-gray-100">Date Posted</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 font-semibold text-left text-gray-900 dark:text-gray-100">Food Type</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 font-semibold text-left text-gray-900 dark:text-gray-100">Location</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 font-semibold text-left text-gray-900 dark:text-gray-100">Quantity</th>
                <th className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 font-semibold text-left text-gray-900 dark:text-gray-100">Expires At</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, i) => (
                <tr key={alert.id} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-blue-50/50 dark:bg-gray-700/50'}>
                  <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{new Date(alert.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{alert.food_type}</td>
                  <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{alert.building}, Room {alert.room}</td>
                  <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{alert.quantity}</td>
                  <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">{new Date(alert.expires_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}
