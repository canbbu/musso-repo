import React, { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CalendarEvent {
  type: 'match' | 'notice';
  title: string;
  status?: 'upcoming' | 'cancelled';
}

interface CalendarViewProps {
  calendarEvents: Record<string, CalendarEvent[]>;
}

const CalendarView = ({ calendarEvents }: CalendarViewProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // 날짜 포맷팅 함수
  const formatDateToLocalString = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // formatDateToLocalString 결과와 calendarEvents 매칭 확인
  const formattedDate = formatDateToLocalString(date);
  console.log('[CalendarView] 날짜별 데이터:', {
    현재날짜: date,
    변환된날짜형식: formattedDate,
    해당날짜이벤트: calendarEvents[formattedDate],
    전체이벤트: calendarEvents
  });

  return (
    <Card className="lg:col-span-2 bg-white flex-1 w-full min-w-0 max-w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-blue-600" />
          팀 일정
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full p-6">
        <div className="calendar-wrapper w-full h-full min-w-0 max-w-full">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="p-0 w-full min-w-0 max-w-full"
            modifiersClassNames={{
              selected: 'bg-blue-500 text-white hover:bg-blue-600',
            }}
            modifiersStyles={{
              event: { border: '2px solid #16a34a' },
              // notice: { backgroundColor: '#e0f2fe' },
              cancelled: { backgroundColor: '#fee2e2', textDecoration: 'line-through' },
            }}
            styles={{
              day: {
                height: '40px'
              },
              months: {
                width: '100%'
              },
              month: {
                width: '100%'
              },
              table: {
                width: '100%'
              }
            }}  
            modifiers={{
              event: (date) => {
                const dateStr = formatDateToLocalString(date);
                return !!calendarEvents[dateStr]?.find(e => e.type === 'match' && e.status !== 'cancelled');
              },
              cancelled: (date) => {
                const dateStr = formatDateToLocalString(date);
                return !!calendarEvents[dateStr]?.find(e => e.type === 'match' && e.status === 'cancelled');
              }
            }}
          />

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center">
              <div className="h-4 w-4 rounded border-2 border-green-500 mr-2"></div>
              <span>이벤트 일정</span>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 rounded bg-blue-100 mr-2"></div>
              <span>공지사항</span>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 rounded bg-red-100 mr-2"></div>
              <span>취소된 이벤트</span>
            </div>
          </div>
        </div>

        {date && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">
              {date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            
            {calendarEvents[formattedDate] ? (
              <ul className="space-y-2">
                {calendarEvents[formattedDate].map((event, idx) => {
                  console.log('[CalendarView] 이벤트 데이터:', {
                    이벤트번호: idx,
                    이벤트타입: event.type,
                    이벤트상태: event.status,
                    이벤트제목: event.title
                  });
                  
                  return (
                    <li key={idx} className="flex items-center">
                      {event.type === 'match' ? (
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          event.status === 'cancelled' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {event.status === 'cancelled' ? '취소된 이벤트' : '이벤트'}
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          공지
                        </div>
                      )}
                      <span className={`ml-2 ${event.status === 'cancelled' ? 'line-through text-red-500' : ''}`}>
                        {event.title}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-500">일정이 없습니다.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarView;
