
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import UserProfileModal from './UserProfileModal';
import { useAuth } from '@/hooks/use-auth';

interface UserProfileButtonProps {
  large?: boolean;
}

const UserProfileButton = ({ large = false }: UserProfileButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { userName } = useAuth();
  
  // Get initials from user name
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const toggleModal = () => setIsOpen(!isOpen);

  // Adjust size based on the large prop
  const size = large ? "h-full w-full" : "h-10 w-10";
  const buttonSize = large ? "h-full w-full" : "h-10 w-10";

  return (
    <>
      <Button 
        variant="ghost" 
        className={`relative ${buttonSize} rounded-full p-0 overflow-hidden`} 
        onClick={toggleModal}
      >
        <Avatar className={size}>
          <AvatarImage src="/placeholder.svg" alt={userName || '사용자'} />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
      </Button>

      <UserProfileModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default UserProfileButton;
