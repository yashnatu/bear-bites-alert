
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Users, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FoodAlert {
  id: string;
  clubName: string;
  foodType: string;
  quantity: string;
  availableUntil: string;
  building: string;
  room: string;
  timePosted: string;
}

const Index = () => {
  const [activeAlerts, setActiveAlerts] = useState<FoodAlert[]>([
    {
      id: '1',
      clubName: 'Computer Science Club',
      foodType: 'Pizza and Sodas',
      quantity: '20 boxes',
      availableUntil: '3:00 PM',
      building: 'Soda Hall',
      room: '306',
      timePosted: '1:30 PM'
    },
    {
      id: '2',
      clubName: 'Business Society',
      foodType: 'Sandwiches and Chips',
      quantity: '15 portions',
      availableUntil: '4:30 PM',
      building: 'Haas School',
      room: 'C135',
      timePosted: '2:15 PM'
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setActiveAlerts(alerts => 
        alerts.filter(alert => {
          const [hours, minutes, period] = alert.availableUntil.split(/[: ]/);
          const alertTime = new Date();
          alertTime.setHours(
            period === 'PM' && hours !== '12' ? parseInt(hours) + 12 : parseInt(hours),
            parseInt(minutes),
            0
          );
          return alertTime > now;
        })
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/916b0df3-f3b3-464e-b06c-d2fc69776b63.png" 
                alt="BearBites Logo" 
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-2xl font-bold text-gray-900">BearBites</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link to="/subscribe" className="text-gray-600 hover:text-blue-600 transition-colors">
                Subscribe
              </Link>
              <Link to="/club-portal">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Club Portal
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Never Miss Free Food on Campus Again! 🍕
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Get instant notifications when clubs share food at UC Berkeley events
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/subscribe">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8">
                <Bell className="w-5 h-5 mr-2" />
                Subscribe for Alerts
              </Button>
            </Link>
            <Link to="/club-portal">
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8">
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
            <h3 className="text-3xl font-bold text-gray-900">Active Food Alerts</h3>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {activeAlerts.length} Active
            </Badge>
          </div>
          
          {activeAlerts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">No Active Alerts</h4>
                <p className="text-gray-600">Check back later for free food opportunities!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeAlerts.map((alert) => (
                <Card key={alert.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-orange-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-blue-900">{alert.clubName}</CardTitle>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <CardDescription className="text-base font-medium text-gray-900">
                      {alert.foodType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">{alert.quantity} available</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">Until {alert.availableUntil}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{alert.building}, Room {alert.room}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="text-xs text-gray-500">Posted at {alert.timePosted}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/lovable-uploads/916b0df3-f3b3-464e-b06c-d2fc69776b63.png" 
              alt="BearBites Logo" 
              className="w-8 h-8 object-contain"
            />
            <h4 className="text-xl font-bold">BearBites</h4>
          </div>
          <p className="text-gray-400">Connecting UC Berkeley students with free food opportunities</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
