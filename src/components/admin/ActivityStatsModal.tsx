import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useActivityLogs } from '@/hooks/use-activity-logs';
import { useAuth } from '@/hooks/use-auth';
import { X, Users, Clock, Smartphone, Monitor, Tablet, Eye } from 'lucide-react';

interface ActivityStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ActivityRecord {
  user_name: string;
  login_time: string;
  logout_time?: string;
  duration_minutes?: number;
  device_type: 'mobile' | 'desktop' | 'tablet';
  page_views: number;
}

const ActivityStatsModal = ({ isOpen, onClose }: ActivityStatsModalProps) => {
  const { getActivityStats, cleanupDuplicateLogs } = useActivityLogs();
  const { canManageSystem } = useAuth();
  const [stats, setStats] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState(7);
  const [cleaningUp, setCleaningUp] = useState(false);

  // 시스템관리자 권한 체크
  if (!canManageSystem) {
    return null;
  }

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getActivityStats(selectedDays);
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('활동 통계 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupDuplicates = async () => {
    setCleaningUp(true);
    try {
      const success = await cleanupDuplicateLogs();
      if (success) {
        alert('중복 로그 정리가 완료되었습니다.');
        await loadStats(); // 통계 새로고침
      } else {
        alert('중복 로그 정리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('중복 로그 정리 실패:', error);
      alert('중복 로그 정리 중 오류가 발생했습니다.');
    } finally {
      setCleaningUp(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen, selectedDays]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '진행 중';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone size={16} className="text-blue-500" />;
      case 'tablet':
        return <Tablet size={16} className="text-green-500" />;
      default:
        return <Monitor size={16} className="text-gray-500" />;
    }
  };

  const getTotalStats = () => {
    const totalSessions = stats.length;
    const activeSessions = stats.filter(s => !s.logout_time).length;
    const totalDuration = stats
      .filter(s => s.duration_minutes)
      .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const averageDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
    
    const deviceStats = stats.reduce((acc, s) => {
      acc[s.device_type] = (acc[s.device_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSessions,
      activeSessions,
      averageDuration,
      deviceStats
    };
  };

  const { totalSessions, activeSessions, averageDuration, deviceStats } = getTotalStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center">
            <Users className="mr-2 h-6 w-6 text-primary" />
            시스템 관리 - 사용자 활동 통계
          </h2>
          <Button variant="ghost" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* 필터 및 요약 통계 */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-2">
              {[7, 14, 30].map(days => (
                <Button
                  key={days}
                  variant={selectedDays === days ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDays(days)}
                >
                  최근 {days}일
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={loadStats}
                disabled={loading}
              >
                새로고침
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCleanupDuplicates}
                disabled={cleaningUp || loading}
              >
                {cleaningUp ? '정리 중...' : '🧹 중복 로그 정리'}
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalSessions}</div>
                  <div className="text-sm text-gray-600">총 접속</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{activeSessions}</div>
                  <div className="text-sm text-gray-600">현재 접속</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{formatDuration(averageDuration)}</div>
                  <div className="text-sm text-gray-600">평균 이용시간</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center gap-2 mb-1">
                    <span className="text-sm">📱{deviceStats.mobile || 0}</span>
                    <span className="text-sm">💻{deviceStats.desktop || 0}</span>
                    <span className="text-sm">📋{deviceStats.tablet || 0}</span>
                  </div>
                  <div className="text-sm text-gray-600">디바이스별</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 상세 활동 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>상세 활동 내역</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : stats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  선택한 기간에 활동 기록이 없습니다.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">사용자</th>
                        <th className="text-left p-2">접속 시간</th>
                        <th className="text-left p-2">종료 시간</th>
                        <th className="text-left p-2">이용시간</th>
                        <th className="text-left p-2">디바이스</th>
                        <th className="text-left p-2">페이지뷰</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.map((record, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{record.user_name}</td>
                          <td className="p-2">{formatDateTime(record.login_time)}</td>
                          <td className="p-2">
                            {record.logout_time ? formatDateTime(record.logout_time) : 
                              <span className="text-green-600 font-medium">접속 중</span>
                            }
                          </td>
                          <td className="p-2">{formatDuration(record.duration_minutes)}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              {getDeviceIcon(record.device_type)}
                              <span className="capitalize">{record.device_type}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <Eye size={14} />
                              {record.page_views}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ActivityStatsModal; 