import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useAttendanceChart } from '@/features/dashboard/hooks/use-attendance-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Calendar } from 'lucide-react';

const AttendanceChart: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);

  const { data, loading, error } = useAttendanceChart({
    year: selectedYear,
    month: selectedMonth,
  });

  // 년도 목록 생성 (현재 년도부터 5년 전까지)
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // 월 목록 생성
  const months = [
    { value: undefined, label: '전체 월' },
    { value: 1, label: '1월' },
    { value: 2, label: '2월' },
    { value: 3, label: '3월' },
    { value: 4, label: '4월' },
    { value: 5, label: '5월' },
    { value: 6, label: '6월' },
    { value: 7, label: '7월' },
    { value: 8, label: '8월' },
    { value: 9, label: '9월' },
    { value: 10, label: '10월' },
    { value: 11, label: '11월' },
    { value: 12, label: '12월' },
  ];

  const chartConfig = {
    attendanceCount: {
      label: '출석 인원수',
      color: 'hsl(var(--chart-1))',
    },
  };

  // 차트 데이터 포맷팅
  const chartData = data.map((item) => ({
    date: item.dateLabel,
    fullDate: item.date, // 툴팁용 전체 날짜
    출석인원수: item.attendanceCount,
  }));

  // 날짜 포맷팅 함수 (YYYY-MM-DD -> YYYY년 MM월 DD일)
  const formatDateForTooltip = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const fullDate = data?.fullDate;
      const attendanceCount = payload[0].value;

      return (
        <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
          <p className="font-medium">
            {fullDate ? formatDateForTooltip(fullDate) : payload[0].payload?.date}
          </p>
          <p className="text-sm text-muted-foreground">
            출석 인원수: <span className="font-medium text-foreground">{attendanceCount}명</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex shrink-0 items-center gap-2">
            <Calendar className="h-5 w-5 shrink-0 text-blue-600" />
            <CardTitle className="whitespace-nowrap text-base sm:text-2xl">출석 인원수 통계</CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}년
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedMonth === undefined ? 'all' : selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(value === 'all' ? undefined : parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem
                    key={month.value === undefined ? 'all' : month.value}
                    value={month.value === undefined ? 'all' : month.value.toString()}
                  >
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <p className="text-red-500 font-medium">오류가 발생했습니다</p>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <p className="text-gray-500">표시할 데이터가 없습니다</p>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full min-w-0">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAttendanceRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-45}
                textAnchor="end"
                height={60}
                tickFormatter={(value) => value}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 'auto']}
                tickFormatter={(value) => `${value}명`}
              />
              <ChartTooltip
                cursor={false}
                content={<CustomTooltip />}
              />
              <Area
                type="monotone"
                dataKey="출석인원수"
                stroke="hsl(var(--chart-1))"
                fill="url(#colorAttendanceRate)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
        {!loading && !error && data.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>평균 출석 인원수: {Math.round(data.reduce((sum, item) => sum + item.attendanceCount, 0) / data.length)}명</span>
              <span>총 경기 수: {data.reduce((sum, item) => sum + item.matchCount, 0)}경기</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceChart;
