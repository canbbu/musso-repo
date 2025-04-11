
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface MatchNotesSectionProps {
  matchNotes: string;
  setMatchNotes: (notes: string) => void;
  mvp: string;
  setMvp: (mvp: string) => void;
}

const MatchNotesSection = ({ matchNotes, setMatchNotes, mvp, setMvp }: MatchNotesSectionProps) => {
  return (
    <div className="mt-6 space-y-4">
      <div>
        <h4 className="mb-2 font-medium">경기 메모</h4>
        <Textarea 
          placeholder="경기에 대한 전반적인 메모를 입력하세요"
          value={matchNotes}
          onChange={(e) => setMatchNotes(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
      
      <div>
        <h4 className="mb-2 font-medium">MVP 선정</h4>
        <Input 
          placeholder="MVP 선수 이름"
          value={mvp}
          onChange={(e) => setMvp(e.target.value)}
        />
      </div>
    </div>
  );
};

export default MatchNotesSection;
