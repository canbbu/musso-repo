import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Activity } from 'lucide-react';

const RunningChart: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);

  // 더미 데이터 생성 (월별 런닝 거리 - km)
  const generateDummyData = () => {
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const data = [];
    
    for (let i = 0; i < months.length; i++) {
      const month = months[i];
      // 더미 데이터: 50~150km 사이의 랜덤 값
      const distance = Math.floor(Math.random() * 100) + 50;
      data.push({
        month,
        거리: distance,
      });
    }
    
    return data;
  };

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
      label: '런닝 거리',
      color: 'hsl(var(--chart-2))',
    },
  };

  // 더미 데이터 생성
  const chartData = generateDummyData();

  // 월 필터 적용
  const filteredData = selectedMonth
    ? chartData.filter((_, index) => index === selectedMonth - 1)
    : chartData;

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const distance = payload[0].value;
      const month = payload[0].payload?.month;

      return (
        <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
          <p className="font-medium">{month}</p>
          <p className="text-sm text-muted-foreground">
            런닝 거리: <span className="font-medium text-foreground">{distance}km</span>
          </p>
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
        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <p className="text-gray-500">표시할 데이터가 없습니다</p>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <LineChart
              data={filteredData}
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
        )}
        {filteredData.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>
                평균 거리: {Math.round(filteredData.reduce((sum, item) => sum + item.거리, 0) / filteredData.length)}km
              </span>
              <span>
                총 거리: {filteredData.reduce((sum, item) => sum + item.거리, 0)}km
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RunningChart;
