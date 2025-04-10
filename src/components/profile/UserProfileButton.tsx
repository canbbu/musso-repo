
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import UserProfileModal from './UserProfileModal';
import { useAuth } from '@/hooks/use-auth';

const UserProfileButton = () => {
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

  return (
    <>
      <Button 
        variant="ghost" 
        className="relative h-10 w-10 rounded-full p-0 overflow-hidden" 
        onClick={toggleModal}
      >
        <Avatar>
          <AvatarImage src="/placeholder.svg" alt={userName || '사용자'} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
      </Button>

      <UserProfileModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default UserProfileButton;
