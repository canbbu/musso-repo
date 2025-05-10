import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const positions = [
  { value: 'GK', label: '골키퍼' },
  { value: 'DF', label: '수비수' },
  { value: 'MF', label: '미드필더' },
  { value: 'FW', label: '공격수' },
];

interface ProfileData {
  name: string;
  nickname: string;
  age: string;
  position: string;
  phone: string;
}

const UserProfileModal = ({ isOpen, onClose }: UserProfileModalProps) => {
  const { userName, role } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: userName || '',
    nickname: '',
    age: '',
    position: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePositionChange = (value: string) => {
    setProfileData(prev => ({ ...prev, position: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to the database
    console.log('Saving profile data:', profileData);
    
    toast({
      title: "프로필 업데이트",
      description: "프로필이 성공적으로 업데이트되었습니다.",
    });
    
    onClose();
  };
  
  // Get initials from user name
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // 역할에 따른 한글 이름 매핑
  const getRoleName = (roleCode: string | null) => {
    switch(roleCode) {
      case 'president':
        return '회장';
      case 'vice_president':
        return '부회장';
      case 'coach':
        return '감독';
      case 'assistant_coach':
        return '코치';
      case 'treasurer':
        return '회계';
      case 'player':
        return '일반회원';
      default:
        return '일반회원';
    }
  };

  // 역할에 따른 배지 색상 설정
  const getRoleBadgeColor = (roleCode: string | null) => {
    switch(roleCode) {
      case 'president':
      case 'vice_president':
        return 'bg-red-500';
      case 'coach':
      case 'assistant_coach':
        return 'bg-blue-500';
      case 'treasurer':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>프로필 설정</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="/placeholder.svg" alt={profileData.name} />
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                  {getInitials(profileData.name)}
                </AvatarFallback>
              </Avatar>
              {role && (
                <Badge 
                  className={`absolute -bottom-2 -right-2 ${getRoleBadgeColor(role)}`}
                >
                  {getRoleName(role)}
                </Badge>
              )}
            </div>
            <Button type="button" variant="outline" size="sm">
              사진 업로드
            </Button>
          </div>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                이름
              </Label>
              <Input
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nickname" className="text-right">
                활동명
              </Label>
              <Input
                id="nickname"
                name="nickname"
                value={profileData.nickname}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">
                나이
              </Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={profileData.age}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                주 포지션
              </Label>
              <Select 
                value={profileData.position} 
                onValueChange={handlePositionChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="포지션 선택" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position.value} value={position.value}>
                      {position.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                전화번호
              </Label>
              <Input
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">저장</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
