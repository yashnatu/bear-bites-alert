
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Clock, MapPin, Users, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';

interface FoodAlert {
  id: string;
  club_name: string;
  food_type: string;
  quantity: string;
  available_until: string;
  building: string;
  room: string;
  created_at: string;
  expires_at: string;
}

const Index = () => {
  const [activeAlerts, setActiveAlerts] = useState<FoodAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch active alerts from Supabase
  const fetchActiveAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('food_alerts')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
        return;
      }

      setActiveAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription and initial fetch
  useEffect(() => {
    fetchActiveAlerts();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'food_alerts'
        },
        (payload) => {
          const newAlert = payload.new as FoodAlert;
          // Only add if it's still active
          if (new Date(newAlert.expires_at) > new Date()) {
            setActiveAlerts(prev => [newAlert, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handler for Post Food Alert button
  const handlePostFoodAlert = () => {
    if (!user) {
      navigate('/auth?redirect=/club-portal');
    } else {
      navigate('/club-portal');
    }
  };
  // Handler for Club Portal button (no custom redirect)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <AppHeader />

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Never Miss Free Food on Campus Again! 🍕
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Get instant notifications when clubs share food at UC Berkeley events
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/subscribe">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8">
                <Bell className="w-5 h-5 mr-2" />
                Subscribe for Alerts
              </Button>
            </Link>
            <Link to="/club-portal" onClick={e => { e.preventDefault(); handlePostFoodAlert(); }}>
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 px-8">
                <Users className="w-5 h-5 mr-2" />
                Post Food Alert
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Active Alerts Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Active Food Alerts</h3>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {activeAlerts.length} Active
            </Badge>
          </div>
          
          {activeAlerts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Active Alerts</h4>
                <p className="text-gray-600 dark:text-gray-300">Check back later for free food opportunities!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeAlerts.map((alert) => (
                <Card key={alert.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-orange-500 dark:border-l-orange-400">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-blue-900 dark:text-blue-300">{alert.club_name}</CardTitle>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>
                    </div>
                    <CardDescription className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {alert.food_type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">{alert.quantity} available</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">Until {new Date(alert.expires_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{alert.building}, Room {alert.room}</span>
                    </div>
                    <div className="pt-2 border-t dark:border-gray-600">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Posted {new Date(alert.created_at).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/lovable-uploads/916b0df3-f3b3-464e-b06c-d2fc69776b63.png" 
              alt="BearBites Logo" 
              className="w-8 h-8 object-contain"
            />
            <h4 className="text-xl font-bold">BearBites</h4>
          </div>
          <p className="text-gray-400 dark:text-gray-500">Connecting UC Berkeley students with free food opportunities.</p>
          <p className="text-gray-400 dark:text-gray-500">All rights reserved. © 2025 BearBites</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
