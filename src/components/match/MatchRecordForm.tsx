
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Match } from '@/hooks/use-match-data';

interface MatchRecordFormProps {
  match: Match;
  onSave: (matchData: Partial<Match>) => void;
}

const MatchRecordForm = ({ match, onSave }: MatchRecordFormProps) => {
  const { toast } = useToast();
  const [score, setScore] = useState(match.score || '');
  const [result, setResult] = useState<'win' | 'loss' | 'draw'>(match.result as 'win' | 'loss' | 'draw' || 'win');
  const [mvp, setMvp] = useState(match.mvp || '');
  const [review, setReview] = useState(match.review || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!score || !result) {
      toast({
        title: "입력 오류",
        description: "점수와 결과를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    // Save match record
    onSave({
      score,
      result,
      mvp,
      review
    });
    
    toast({
      title: "경기 기록 저장 완료",
      description: "경기 기록이 성공적으로 저장되었습니다."
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>경기 기록</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="score">점수</Label>
            <Input 
              id="score" 
              placeholder="예: 3-2" 
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="result">결과</Label>
            <Select value={result} onValueChange={(value: 'win' | 'loss' | 'draw') => setResult(value)}>
              <SelectTrigger>
                <SelectValue placeholder="결과 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="win">승리</SelectItem>
                <SelectItem value="draw">무승부</SelectItem>
                <SelectItem value="loss">패배</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mvp">MVP 선수</Label>
            <Input 
              id="mvp" 
              placeholder="MVP 선수 이름" 
              value={mvp}
              onChange={(e) => setMvp(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="review">경기 총평</Label>
            <Textarea 
              id="review" 
              placeholder="경기에 대한 총평을 입력하세요" 
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit">저장</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default MatchRecordForm;
