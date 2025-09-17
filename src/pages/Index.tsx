
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Clock, MapPin, Users, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
//import { useDarkMode } from '../App';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface FoodAlert {
  id: string;
  club_name: string;
  food_type: string;
  quantity: string;
  available_until: string;
  building: string;
  room: string;
  created_at: string;
}

const Index = () => {
  const [activeAlerts, setActiveAlerts] = useState<FoodAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
          if (new Date(newAlert.created_at + 'T' + newAlert.available_until) > new Date()) {
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
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/916b0df3-f3b3-464e-b06c-d2fc69776b63.png" 
                alt="BearBites Logo" 
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">BearBites</h1>
            </div>
            <nav className="flex items-center space-x-6">
              {!user && (
                <Link to="/auth?redirect=%2F">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Sign In
                  </Button>
                </Link>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center ml-4">
                    <Switch
                      checked={darkMode}
                      onCheckedChange={toggleDarkMode}
                      aria-label="Toggle dark mode"
                      className="data-[state=checked]:bg-gray-800 data-[state=unchecked]:bg-gray-200"
                    >
                      {darkMode ? <Moon className="w-4 h-4 text-yellow-400" /> : <Sun className="w-4 h-4 text-gray-800" />}
                    </Switch>
                    <span className="ml-2">{darkMode ? <Moon className="w-4 h-4 text-yellow-400" /> : <Sun className="w-4 h-4 text-gray-800 dark:text-gray-200" />}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Toggle dark mode</TooltipContent>
              </Tooltip>
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="ml-4 focus:outline-none">
                      <Avatar>
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                        <AvatarFallback>{user.email?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-4 py-2">
                      <div className="font-bold">{user.user_metadata?.full_name || user.email}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/my-alerts')} className="cursor-pointer">My Food Alerts</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer">Sign Out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </nav>
          </div>
        </div>
      </header>

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
                      <span className="text-sm">Until {alert.available_until}</span>
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
