import { Link } from 'react-router-dom';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  backTo?: string;
  showAuth?: boolean;
}

export const AppHeader = ({ 
  title = "BearBites", 
  showBackButton = false, 
  backTo = "/",
  showAuth = true 
}: AppHeaderProps) => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            {showBackButton && (
              <Link 
                to={backTo} 
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            )}
            <img 
              src="/lovable-uploads/916b0df3-f3b3-464e-b06c-d2fc69776b63.png" 
              alt="BearBites Logo" 
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          </div>
          
          <nav className="flex items-center space-x-6">
            {/* Auth Section */}
            {showAuth && !user && (
              <Link to="/auth?redirect=%2F">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Sign In
                </Button>
              </Link>
            )}
            
            {/* Dark Mode Toggle */}
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
            
            {/* User Dropdown */}
            {showAuth && user && (
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
                  <DropdownMenuItem onClick={() => navigate('/my-alerts')} className="cursor-pointer">
                    My Food Alerts
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
