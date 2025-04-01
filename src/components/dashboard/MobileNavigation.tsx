
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavItem {
  title: string;
  path: string;
}

interface MobileNavigationProps {
  navItems: NavItem[];
}

const MobileNavigation = ({ navItems }: MobileNavigationProps) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm py-2 px-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold">축구회 관리</h1>
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[240px] sm:w-[300px]">
          <div className="py-6">
            <h2 className="text-lg font-semibold mb-4 px-2">메뉴</h2>
            <nav>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left"
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                    >
                      {item.title}
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNavigation;
