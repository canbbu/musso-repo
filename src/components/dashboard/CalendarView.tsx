
import React, { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CalendarEvent {
  type: 'match' | 'notice';
  title: string;
  status?: 'scheduled' | 'cancelled';
}

interface CalendarViewProps {
  calendarEvents: Record<string, CalendarEvent[]>;
}

const CalendarView = ({ calendarEvents }: CalendarViewProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Card className="lg:col-span-2 bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-blue-600" />
          팀 일정
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="calendar-wrapper h-full w-full">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="p-0 w-full"
            modifiersClassNames={{
              selected: 'bg-blue-500 text-white hover:bg-blue-600',
            }}
            modifiersStyles={{
              event: { border: '2px solid #16a34a' },
              notice: { backgroundColor: '#e0f2fe' },
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
                const dateStr = date.toISOString().split('T')[0];
                return !!calendarEvents[dateStr]?.find(e => e.type === 'match' && e.status !== 'cancelled');
              },
              notice: (date) => {
                const dateStr = date.toISOString().split('T')[0];
                return !!calendarEvents[dateStr]?.find(e => e.type === 'notice');
              },
              cancelled: (date) => {
                const dateStr = date.toISOString().split('T')[0];
                return !!calendarEvents[dateStr]?.find(e => e.type === 'match' && e.status === 'cancelled');
              }
            }}
          />

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center">
              <div className="h-4 w-4 rounded border-2 border-green-500 mr-2"></div>
              <span>경기 일정</span>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 rounded bg-blue-100 mr-2"></div>
              <span>공지사항</span>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 rounded bg-red-100 mr-2"></div>
              <span>취소된 경기</span>
            </div>
          </div>
        </div>

        {date && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">
              {date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            
            {calendarEvents[date.toISOString().split('T')[0]] ? (
              <ul className="space-y-2">
                {calendarEvents[date.toISOString().split('T')[0]].map((event, idx) => (
                  <li key={idx} className="flex items-center">
                    {event.type === 'match' ? (
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        event.status === 'cancelled' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {event.status === 'cancelled' ? '취소된 경기' : '경기'}
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
                ))}
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
