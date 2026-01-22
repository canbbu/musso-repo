import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Activity } from 'lucide-react';
import { useRunningChart } from '@/features/dashboard/hooks/use-running-chart';

const RunningChart: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);

  const { data, loading, error } = useRunningChart({
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
    distance: {
      label: '총 거리',
      color: 'hsl(var(--chart-2))',
    },
  };

  // 차트 데이터 포맷팅
  const chartData = data.map((item) => ({
    month: item.month,
    거리: item.totalDistance,
    평균페이스: item.averagePace,
  }));

  // 전체 평균 페이스 계산
  const overallAveragePace = data.length > 0
    ? data.reduce((sum, item) => sum + item.averagePace, 0) / data.length
    : 0;

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const distance = payload[0].value;
      const pace = data?.평균페이스;

      return (
        <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
          <p className="font-medium">{data?.month}</p>
          <p className="text-sm text-muted-foreground">
            총 거리: <span className="font-medium text-foreground">{distance}km</span>
          </p>
          {pace && (
            <p className="text-sm text-muted-foreground">
              평균 페이스: <span className="font-medium text-foreground">{pace.toFixed(2)} 분/km</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            <CardTitle>런닝 통계</CardTitle>
          </div>
          <div className="flex items-center gap-2">
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
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
          <div className="relative">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[0, 'auto']}
                  tickFormatter={(value) => `${value}km`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<CustomTooltip />}
                />
                <Line
                  type="monotone"
                  dataKey="거리"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-2))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
            {/* 그래프 중간에 평균 페이스 표시 */}
            {overallAveragePace > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg border shadow-lg">
                  <p className="text-xs text-gray-600 mb-1">전체 평균 페이스</p>
                  <p className="text-2xl font-bold text-green-700">
                    {overallAveragePace.toFixed(2)} <span className="text-sm font-normal">분/km</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        {!loading && !error && data.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>
                평균 거리: {Math.round(data.reduce((sum, item) => sum + item.totalDistance, 0) / data.length * 100) / 100}km
              </span>
              <span className="font-semibold text-green-700">
                전체 평균 페이스: {overallAveragePace.toFixed(2)} 분/km
              </span>
              <span>
                총 거리: {Math.round(data.reduce((sum, item) => sum + item.totalDistance, 0) * 100) / 100}km
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RunningChart;
