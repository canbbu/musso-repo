import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Activity } from 'lucide-react';
import { useRunningChart } from '@/features/dashboard/hooks/use-running-chart';

type GroupByOption = 'month' | 'week';

const RunningChart: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [groupBy, setGroupBy] = useState<GroupByOption>('month');

  const { data, loading, error } = useRunningChart({
    year: selectedYear,
    month: selectedMonth,
    groupBy,
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

  // 눈에 잘 띄는 그린 계열 (가독성)
  const lineColor = '#15803d';
  const chartConfig = {
    distance: {
      label: '총 거리 (km)',
      color: lineColor,
    },
  };

  // 차트 데이터 포맷팅 (월별/주별 공통: periodLabel 사용)
  const chartData = data.map((item) => ({
    periodLabel: item.periodLabel,
    거리: item.totalDistance,
    평균페이스: item.averagePace,
  }));

  // 전체 평균 페이스 계산
  const overallAveragePace = data.length > 0
    ? data.reduce((sum, item) => sum + item.averagePace, 0) / data.length
    : 0;

  // 커스텀 툴팁 - 글자 크기·대비 강화
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const distance = payload[0].value;
      const pace = data?.평균페이스;

      return (
        <div className="rounded-lg border-2 border-green-200 bg-white px-4 py-3 shadow-lg border-l-4 border-l-green-600">
          <p className="text-base font-semibold text-gray-900 mb-2">{data?.periodLabel}</p>
          <p className="text-sm text-gray-700">
            총 거리: <span className="font-bold text-green-700">{distance} km</span>
          </p>
          {pace !== undefined && (
            <p className="text-sm text-gray-700 mt-1">
              평균 페이스: <span className="font-bold text-green-700">{pace.toFixed(2)} 분/km</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            <CardTitle>런닝 통계</CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={groupBy}
              onValueChange={(value) => setGroupBy(value as GroupByOption)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">월별</SelectItem>
                <SelectItem value="week">주별</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}년
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {groupBy === 'month' && (
              <Select
                value={selectedMonth === undefined ? 'all' : selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(value === 'all' ? undefined : parseInt(value))}
              >
                <SelectTrigger className="w-[100px]">
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
            )}
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
          <div className="relative w-full min-w-0 overflow-hidden">
            {/* 축·그리드 글자 크기·색상 강화 (가독성) */}
            <ChartContainer
              config={chartConfig}
              className="h-[320px] w-full min-w-0 [&_.recharts-cartesian-axis-tick_text]:fill-gray-700 [&_.recharts-cartesian-axis-tick_text]:text-[13px] [&_.recharts-cartesian-grid_horizontal_line]:stroke-gray-200 [&_.recharts-cartesian-grid_vertical_line]:stroke-gray-200"
            >
              <LineChart
                data={chartData}
                margin={{
                  top: 16,
                  right: 16,
                  left: 8,
                  bottom: groupBy === 'week' ? 60 : 24,
                }}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical={true} horizontal={true} />
                <XAxis
                  dataKey="periodLabel"
                  tickLine={false}
                  axisLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                  tickMargin={10}
                  height={groupBy === 'week' ? 60 : 36}
                  tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                  tickFormatter={(value) => value}
                  interval={groupBy === 'week' ? 0 : undefined}
                  angle={groupBy === 'week' ? -45 : 0}
                  textAnchor={groupBy === 'week' ? 'end' : 'middle'}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                  tickMargin={10}
                  tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                  domain={[0, 'auto']}
                  tickFormatter={(value) => `${value} km`}
                  width={56}
                />
                <ChartTooltip cursor={{ stroke: lineColor, strokeWidth: 1, strokeDasharray: '4 4' }} content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="거리"
                  stroke={lineColor}
                  strokeWidth={3}
                  dot={{
                    fill: '#fff',
                    stroke: lineColor,
                    strokeWidth: 2,
                    r: 6,
                  }}
                  activeDot={{
                    r: 8,
                    fill: lineColor,
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ChartContainer>
            {/* 전체 평균 페이스: 그래프를 가리지 않도록 우측 상단 작게 표시 */}
            {overallAveragePace > 0 && (
              <div className="absolute top-2 right-2 pointer-events-none rounded-md bg-green-600/90 px-3 py-1.5 text-white shadow-md">
                <p className="text-[11px] font-medium opacity-90">평균 페이스</p>
                <p className="text-lg font-bold leading-tight">{overallAveragePace.toFixed(2)} <span className="text-xs font-normal">분/km</span></p>
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
