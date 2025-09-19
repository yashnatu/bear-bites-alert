
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Users, Mail, Lock, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';

const Auth = () => {
  const { signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to extract redirect param
  const getRedirectPath = () => {
    const params = new URLSearchParams(location.search);
    return params.get('redirect') || '/';
  };

  // Wrap signInWithGoogle to redirect after sign in
  const handleSignIn = async () => {
    const redirectPath = getRedirectPath();
    localStorage.setItem('postSignInRedirect', redirectPath);
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <AppHeader title="BearBites Club Portal" showBackButton={true} showAuth={false} />

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Club Login</CardTitle>
              <CardDescription>
                Sign in to your club account to post food alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSignIn}
                className="w-full bg-red-500 hover:bg-red-600"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Sign in with Google'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
