import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/shared/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { toast } from 'sonner';
import { Users, CheckCircle, XCircle, ArrowLeft, Save } from 'lucide-react';
import { useAttendance } from '@/hooks/use-attendance';

const AttendanceCheck: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const {
    allPlayers,
    attendingPlayers,
    matchInfo,
    loading,
    saving,
    error,
    togglePlayerAttendance,
    toggleAllPlayers,
    saveAttendance
  } = useAttendance(matchId);

  const handleSaveAttendance = async () => {
    try {
      const result = await saveAttendance();
      if (result.success) {
        toast.success(`출석체크가 완료되었습니다. (출석: ${result.attendingCount}명)`);
        navigate(`/tactics/${matchId}/1`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '출석 데이터 저장 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">선수 목록을 불러오는 중...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-red-500">오류: {error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/tactics`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              돌아가기
            </Button>
            <h1 className="text-3xl font-bold">출석체크</h1>
          </div>
          
          {matchInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">
                경기 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-700">경기 번호:</span>
                  <span className="ml-2 text-blue-900">#{matchInfo.id}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">상대팀:</span>
                  <span className="ml-2 text-blue-900">{matchInfo.opponent || '미정'}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">경기 날짜:</span>
                  <span className="ml-2 text-blue-900">{formatDate(matchInfo.date)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Users className="w-5 h-5" />
                출석 선수 선택
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 border-green-300 text-green-700">
                  총 {allPlayers.length}명
                </Badge>
                <Badge variant="outline" className="bg-blue-100 border-blue-300 text-blue-700">
                  출석 {attendingPlayers.size}명
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllPlayers(true)}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                전체 선택
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAllPlayers(false)}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                전체 해제
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allPlayers.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    attendingPlayers.has(player.id)
                      ? 'bg-green-50 border-green-300 shadow-md'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => togglePlayerAttendance(player.id)}
                >
                  <Checkbox
                    checked={attendingPlayers.has(player.id)}
                    onChange={() => togglePlayerAttendance(player.id)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {player.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {player.position}
                    </div>
                  </div>
                  {attendingPlayers.has(player.id) && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
              ))}
            </div>

            {allPlayers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>등록된 선수가 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => navigate(`/tactics/${matchId}/1`)}
            variant="outline"
            className="flex-1"
          >
            작전판으로 이동
          </Button>
          <Button
            onClick={handleSaveAttendance}
            disabled={saving || attendingPlayers.size === 0}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                저장 중...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                출석체크 완료 ({attendingPlayers.size}명)
              </div>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AttendanceCheck; 