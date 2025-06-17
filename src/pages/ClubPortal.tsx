
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const ClubPortal = () => {
  const [formData, setFormData] = useState({
    clubName: '',
    contactEmail: '',
    foodType: '',
    quantity: '',
    availableUntil: '',
    building: '',
    room: '',
    additionalInfo: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call to send notification
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Food Alert Sent!",
        description: "Your food notification has been sent to all subscribed students.",
      });
      
      // Reset form
      setFormData({
        clubName: '',
        contactEmail: '',
        foodType: '',
        quantity: '',
        availableUntil: '',
        building: '',
        room: '',
        additionalInfo: ''
      });
    }, 1500);
  };

  const buildings = [
    'Soda Hall', 'Wheeler Hall', 'Dwinelle Hall', 'Evans Hall', 'Pimentel Hall',
    'Haas School of Business', 'Cory Hall', 'Etcheverry Hall', 'Stanley Hall',
    'Life Sciences Building', 'Valley Life Sciences Building', 'Hearst Memorial Mining Building'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link to="/" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mr-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🐻</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">BearBites Club Portal</h1>
            </div>
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
                Share information about free food at your club event. This will notify all subscribed students immediately.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clubName">Club Name *</Label>
                    <Input
                      id="clubName"
                      type="text"
                      placeholder="e.g., Computer Science Club"
                      value={formData.clubName}
                      onChange={(e) => handleInputChange('clubName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="club@berkeley.edu"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      required
                    />
                  </div>
                </div>

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
                    <Label htmlFor="availableUntil">Available Until *</Label>
                    <Input
                      id="availableUntil"
                      type="time"
                      value={formData.availableUntil}
                      onChange={(e) => handleInputChange('availableUntil', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  disabled={isLoading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? 'Sending Alert...' : 'Send Food Alert'}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📧 What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Email sent immediately to all subscribed students</li>
                  <li>• Alert appears on the homepage until expiration time</li>
                  <li>• Students receive location and availability details</li>
                  <li>• Alert automatically expires at the specified time</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClubPortal;
