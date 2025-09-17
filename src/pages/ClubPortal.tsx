
import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Send, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const ClubPortal = () => {
  const { user, session, signOut, loading } = useAuth();
  const [profile, setProfile] = useState<{ club_name: string; club_email: string; terms_accepted: boolean } | null>(null);
  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    availableDate: '', // new field for date
    availableUntil: '',
    building: '',
    room: '',
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user profile
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('club_name, club_email, terms_accepted')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      };
      
      fetchProfile();
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    
    setIsSubmitting(true);

    try {
      // Combine date and time for expiration
      const [year, month, day] = formData.availableDate.split('-').map(Number);
      const [hours, minutes] = formData.availableUntil.split(':').map(Number);
      const expiresAt = new Date(year, month - 1, day, hours, minutes);

      // Validate that the selected date/time is not in the past (Pacific timezone)
      // Create current time in Pacific timezone (handles PST/PDT automatically)
      const nowInPacific = new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"});
      const currentPacificTime = new Date(nowInPacific);
      
      // Create the selected time assuming it's in Pacific timezone
      const selectedPacificTime = new Date(`${formData.availableDate}T${formData.availableUntil}:00`);
      
      if (selectedPacificTime <= currentPacificTime) {
        toast({
          title: "Invalid Date/Time",
          description: "Food alert date and time must be in the future (Pacific timezone).",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('food_alerts')
        .insert({
          club_id: user.id,
          club_name: profile.club_name,
          contact_email: profile.club_email,
          food_type: formData.foodType,
          quantity: formData.quantity,
          available_until: formData.availableUntil,
          building: formData.building,
          room: formData.room,
          additional_info: formData.additionalInfo,
          expires_at: expiresAt.toISOString(),
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Food Alert Sent!",
        description: "Your food notification has been posted successfully.",
      });
      // Send email to all subscribers
      await fetch('https://taokuapzuxmtpznvkuuu.functions.supabase.co/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          club_name: profile.club_name,
          food_type: formData.foodType,
          building: formData.building,
          room: formData.room,
          available_until: `${formData.availableDate} until ${formData.availableUntil}`,
        }),
      });
      // Reset form
      setFormData({
        foodType: '',
        quantity: '',
        availableDate: '',
        availableUntil: '',
        building: '',
        room: '',
        additionalInfo: ''
      });
    } catch (error) {
      console.error('Error submitting food alert:', error);
      toast({
        title: "Error",
        description: "Failed to post food alert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/lovable-uploads/916b0df3-f3b3-464e-b06c-d2fc69776b63.png" 
            alt="BearBites Logo" 
            className="w-8 h-8 object-contain mx-auto mb-4"
          />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to terms if not accepted
  if (profile && !profile.terms_accepted) {
    return <Navigate to="/terms?redirect=%2Fclub-portal" replace />;
  }

  const buildings = [
    'Soda Hall', 'Wheeler Hall', 'Dwinelle Hall', 'Evans Hall', 'Pimentel Hall',
    'Haas School of Business', 'Cory Hall', 'Etcheverry Hall', 'Stanley Hall',
    'Life Sciences Building', 'Valley Life Sciences Building', 'Hearst Memorial Mining Building'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mr-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/916b0df3-f3b3-464e-b06c-d2fc69776b63.png" 
                  alt="BearBites Logo" 
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">BearBites Club Portal</h1>
                  {profile && (
                    <p className="text-sm text-gray-600">Welcome, {profile.club_name}</p>
                  )}
                </div>
              </div>
            </div>
            <Button 
              onClick={signOut}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Post a Food Alert</CardTitle>
              <CardDescription>
                Share information about free food at your club event. This will notify all subscribed students.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="foodType">Food Type *</Label>
                  <Input
                    id="foodType"
                    type="text"
                    placeholder="e.g., Pizza and sodas, Sandwiches, Donuts"
                    value={formData.foodType}
                    onChange={(e) => handleInputChange('foodType', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity Available *</Label>
                    <Input
                      id="quantity"
                      type="text"
                      placeholder="e.g., 20 boxes, 50 portions"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availableDate">Available Date * (Pacific Time)</Label>
                    <Input
                      id="availableDate"
                      type="date"
                      value={formData.availableDate}
                      onChange={(e) => handleInputChange('availableDate', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availableUntil">Available Until (Time) * (Pacific Time)</Label>
                    <Input
                      id="availableUntil"
                      type="time"
                      value={formData.availableUntil}
                      onChange={(e) => handleInputChange('availableUntil', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="building">Building *</Label>
                    <Select onValueChange={(value) => handleInputChange('building', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select building" />
                      </SelectTrigger>
                      <SelectContent>
                        {buildings.map((building) => (
                          <SelectItem key={building} value={building}>
                            {building}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room">Room Number *</Label>
                    <Input
                      id="room"
                      type="text"
                      placeholder="e.g., 306, C135"
                      value={formData.room}
                      onChange={(e) => handleInputChange('room', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Any additional details students should know..."
                    value={formData.additionalInfo}
                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Posting Alert...' : 'Post Food Alert'}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">📧 What happens next?</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Alert posted immediately for all students to see</li>
                  <li>• Alert appears on the homepage until expiration time</li>
                  <li>• Students can see location and availability details</li>
                  <li>• Alert automatically expires at the specified time</li>
                </ul>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">⏰ Timezone Note</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  All times are in Pacific Time (PST/PDT). Make sure your date and time are in the future!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClubPortal;
