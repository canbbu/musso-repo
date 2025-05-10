import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * 데이터 입력 기능 테스트를 위한 컴포넌트
 */
export const SupabaseDataTester = () => {
  const [selectedTable, setSelectedTable] = useState<string>('announcements');
  const [tableData, setTableData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  const [isRealtime, setIsRealtime] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<any>(null);

  // 사용 가능한 테이블 목록
  const tables = ['announcements', 'matches', 'transactions', 'dues'];

  // 테이블 데이터 불러오기
  const fetchTableData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from(selectedTable)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // 데이터가 있으면 컬럼을 추출하여 설정
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        setTableColumns(columns);
        
        // 빈 폼 값 초기화
        const initialFormValues: Record<string, any> = {};
        columns.forEach(col => {
          // id와 타임스탬프 필드는 제외
          if (!['id', 'created_at', 'updated_at'].includes(col)) {
            initialFormValues[col] = '';
          }
        });
        setFormValues(initialFormValues);
      } else {
        setTableColumns([]);
      }
      
      setTableData(data || []);
    } catch (err: any) {
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 테이블 선택 변경 시 데이터 불러오기
  useEffect(() => {
    fetchTableData();
    
    // 이전 구독 정리
    if (subscription) {
      subscription.unsubscribe();
      setSubscription(null);
    }
    
    // 실시간 구독이 활성화된 경우 새 구독 설정
    if (isRealtime) {
      setupRealtimeSubscription();
    }
  }, [selectedTable, isRealtime]);

  // 실시간 구독 설정
  const setupRealtimeSubscription = () => {
    const newSubscription = supabase
      .channel(`${selectedTable}-changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: selectedTable
      }, (payload) => {
        console.log('실시간 변경 감지:', payload);
        
        // 변경 유형에 따라 UI 업데이트
        if (payload.eventType === 'INSERT') {
          setTableData(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setTableData(prev => 
            prev.map(item => item.id === payload.new.id ? payload.new : item)
          );
        } else if (payload.eventType === 'DELETE') {
          setTableData(prev => 
            prev.filter(item => item.id !== payload.old.id)
          );
        }
      })
      .subscribe();
    
    setSubscription(newSubscription);
  };

  // 입력 필드 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  // 데이터 추가
  const handleAddData = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 폼 값에서 빈 문자열을 null로 변환
      const dataToInsert = { ...formValues };
      Object.keys(dataToInsert).forEach(key => {
        if (dataToInsert[key] === '') {
          dataToInsert[key] = null;
        }
      });

      const { data, error } = await supabase
        .from(selectedTable)
        .insert([dataToInsert])
        .select();

      if (error) throw error;
      
      if (!isRealtime) {
        // 실시간 구독이 없는 경우 수동으로 UI 업데이트
        setTableData(prev => [...(data || []), ...prev]);
      }
      
      // 폼 초기화
      const resetFormValues: Record<string, any> = {};
      Object.keys(formValues).forEach(key => {
        resetFormValues[key] = '';
      });
      setFormValues(resetFormValues);
      
      alert('데이터가 성공적으로 추가되었습니다!');
    } catch (err: any) {
      setError(err.message || '데이터를 추가하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 데이터 삭제
  const handleDeleteItem = async (id: string | number) => {
    if (!window.confirm('이 항목을 삭제하시겠습니까?')) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from(selectedTable)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      if (!isRealtime) {
        // 실시간 구독이 없는 경우 수동으로 UI 업데이트
        setTableData(prev => prev.filter(item => item.id !== id));
      }
      
      alert('항목이 삭제되었습니다.');
    } catch (err: any) {
      setError(err.message || '항목을 삭제하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Supabase 데이터 테스터</h1>
      
      {/* 테이블 선택 */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">테이블 선택:</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tables.map(table => (
            <button
              key={table}
              className={`px-4 py-2 rounded ${selectedTable === table 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              onClick={() => setSelectedTable(table)}
            >
              {table}
            </button>
          ))}
        </div>
        
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            id="realtimeToggle"
            checked={isRealtime}
            onChange={() => setIsRealtime(prev => !prev)}
            className="mr-2"
          />
          <label htmlFor="realtimeToggle">실시간 업데이트 사용</label>
        </div>
        
        <button
          onClick={fetchTableData}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={isLoading}
        >
          {isLoading ? '로딩 중...' : '데이터 새로고침'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* 데이터 입력 폼 */}
      <div className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-3">새 데이터 추가</h2>
        
        <form onSubmit={handleAddData}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(formValues).map(field => (
              <div key={field} className="mb-2">
                <label className="block text-sm font-medium mb-1">{field}:</label>
                
                {/* 일반적인 필드는 입력 필드로 표시 */}
                {['type', 'status'].includes(field) ? (
                  <select
                    name={field}
                    value={formValues[field]}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">-- 선택 --</option>
                    {field === 'type' && (
                      <>
                        <option value="notice">notice</option>
                        <option value="match">match</option>
                      </>
                    )}
                    {field === 'status' && (
                      <>
                        <option value="confirmed">confirmed</option>
                        <option value="pending">pending</option>
                        <option value="cancelled">cancelled</option>
                      </>
                    )}
                  </select>
                ) : field.includes('content') ? (
                  <textarea
                    name={field}
                    value={formValues[field]}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                ) : field.includes('date') || field.includes('time') ? (
                  <input
                    type="datetime-local"
                    name={field}
                    value={formValues[field]}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                ) : field.includes('amount') || field.includes('fee') ? (
                  <input
                    type="number"
                    name={field}
                    value={formValues[field]}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                ) : (
                  <input
                    type="text"
                    name={field}
                    value={formValues[field]}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                )}
              </div>
            ))}
          </div>
          
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : '저장'}
          </button>
        </form>
      </div>
      
      {/* 데이터 표시 */}
      <div>
        <h2 className="text-xl font-semibold mb-3">
          {selectedTable} 테이블 데이터 ({tableData.length}개 항목)
        </h2>
        
        {isLoading && <p className="text-gray-500">로딩 중...</p>}
        
        {!isLoading && tableData.length === 0 ? (
          <p className="text-gray-500">데이터가 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  {tableColumns.map(column => (
                    <th key={column} className="py-2 px-3 border text-left text-sm">{column}</th>
                  ))}
                  <th className="py-2 px-3 border text-left text-sm">작업</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50">
                    {tableColumns.map(column => (
                      <td key={column} className="py-2 px-3 border text-sm">
                        {typeof item[column] === 'object' 
                          ? JSON.stringify(item[column]) 
                          : String(item[column] ?? '')}
                      </td>
                    ))}
                    <td className="py-2 px-3 border">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseDataTester; 