// src/components/SupabaseDataTester.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// 필드 설정 인터페이스 정의
interface FieldConfig {
  type: string;
  required?: boolean;
  label?: string;
  options?: Array<{value: string, label: string}>;
  dynamicOptions?: string;
  step?: string;
}

// 테이블 이름 목록
const TABLES = [
  'players',
  'announcements',
  'matches',
  'match_attendance',
  'calendar_events',
  'transactions',
  'member_dues'
];

// 테이블별 필드 정의
const TABLE_SCHEMAS: Record<string, Record<string, FieldConfig>> = {
  'players': {
    name: { type: 'text', required: true, label: '이름' }
  },
  'announcements': {
    title: { type: 'text', required: true, label: '제목' },
    type: { 
      type: 'select', 
      required: true, 
      label: '유형',
      options: [
        { value: 'notice', label: '공지사항' },
        { value: 'match', label: '이벤트 관련' }
      ]
    },
    content: { type: 'textarea', required: true, label: '내용' },
    date: { type: 'date', required: true, label: '날짜' },
    author: { type: 'text', required: true, label: '작성자' },
    location: { type: 'text', label: '장소' },
    opponent: { type: 'text', label: '상대팀' },
    match_time: { type: 'datetime-local', label: '이벤트 시간' },
    attendance_tracking: { type: 'checkbox', label: '출석 체크' },
    is_match: { type: 'checkbox', label: '이벤트 여부' }
  },
  'matches': {
    date: { type: 'date', required: true, label: '날짜' },
    location: { type: 'text', required: true, label: '장소' },
    opponent: { type: 'text', label: '상대팀' },
    status: { 
      type: 'select', 
      label: '상태',
      options: [
        { value: 'upcoming', label: '예정됨' },
        { value: 'cancelled', label: '취소됨' }
      ]
    }
  },
  'match_attendance': {
    match_id: { 
      type: 'select', 
      required: true, 
      label: '이벤트',
      dynamicOptions: 'matches'
    },
    player_id: { 
      type: 'select', 
      required: true, 
      label: '선수',
      dynamicOptions: 'players'
    },
    status: { 
      type: 'select', 
      required: true, 
      label: '참석 상태',
      options: [
        { value: 'attending', label: '참석' },
        { value: 'not_attending', label: '불참' },
        { value: 'pending', label: '미정' }
      ]
    }
  },
  'calendar_events': {
    type: { 
      type: 'select', 
      required: true, 
      label: '유형',
      options: [
        { value: 'match', label: '이벤트' },
        { value: 'notice', label: '공지' }
      ]
    },
    title: { type: 'text', required: true, label: '제목' },
    date: { type: 'date', required: true, label: '날짜' },
    status: { 
      type: 'select', 
      label: '상태',
      options: [
        { value: 'upcoming', label: '예정됨' },
        { value: 'cancelled', label: '취소됨' }
      ]
    }
  },
  'transactions': {
    date: { type: 'date', required: true, label: '날짜' },
    description: { type: 'text', required: true, label: '설명' },
    amount: { type: 'number', required: true, label: '금액', step: '0.01' },
    type: { 
      type: 'select', 
      required: true, 
      label: '종류',
      options: [
        { value: 'income', label: '수입' },
        { value: 'expense', label: '지출' }
      ]
    },
    category: { type: 'text', required: true, label: '카테고리' },
    member: { type: 'text', label: '회원' }
  },
  'member_dues': {
    name: { type: 'text', required: true, label: '이름' },
    paid: { type: 'checkbox', label: '납부 여부' },
    due_date: { type: 'date', required: true, label: '납부 기한' },
    amount: { type: 'number', required: true, label: '금액', step: '0.01' },
    paid_date: { type: 'date', label: '납부일' },
    paid_amount: { type: 'number', label: '납부 금액', step: '0.01' }
  }
};

export function SupabaseDataTester() {
  const [activeTable, setActiveTable] = useState(TABLES[0]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formFields, setFormFields] = useState<Record<string, any>>({});
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, any[]>>({
    players: [],
    matches: []
  });

  useEffect(() => {
    async function fetchTableData() {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from(activeTable)
          .select('*')
          .limit(100);
        
        if (error) throw error;
        setTableData(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다');
        setTableData([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTableData();
  }, [activeTable, refreshCounter]);

  // 드롭다운 선택을 위한 동적 옵션 로드
  useEffect(() => {
    async function loadDynamicOptions() {
      try {
        // players 테이블에서 선수 목록 가져오기
        const { data: playersData } = await supabase
          .from('players')
          .select('id, name');
        
        if (playersData) {
          setDynamicOptions(prev => ({
            ...prev,
            players: playersData.map(player => ({
              value: player.id,
              label: player.name
            }))
          }));
        }
        
        // matches 테이블에서 이벤트 목록 가져오기
        const { data: matchesData } = await supabase
          .from('matches')
          .select('id, date, opponent');
        
        if (matchesData) {
          setDynamicOptions(prev => ({
            ...prev,
            matches: matchesData.map(match => ({
              value: match.id,
              label: `${new Date(match.date).toLocaleDateString()}  ${match.opponent || '미정'}`
            }))
          }));
        }
      } catch (err) {
        console.error('동적 옵션 로딩 오류:', err);
      }
    }
    
    loadDynamicOptions();
  }, [refreshCounter]);

  // 테이블 변경 시 폼 필드 초기화
  useEffect(() => {
    resetForm();
  }, [activeTable]);

  // 데이터 새로고침
  const handleRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };

  // 폼 초기화
  const resetForm = () => {
    // 현재 테이블의 스키마 가져오기
    const schema = TABLE_SCHEMAS[activeTable] || {};
    
    // 스키마에 따라 기본값 설정
    const defaultValues: Record<string, any> = {};
    Object.entries(schema).forEach(([fieldName, fieldConfig]: [string, any]) => {
      if (fieldConfig.type === 'checkbox') {
        defaultValues[fieldName] = false;
      } else if (fieldConfig.type === 'select' && fieldConfig.options?.length > 0) {
        defaultValues[fieldName] = fieldConfig.options[0].value;
      } else {
        defaultValues[fieldName] = '';
      }
    });
    
    setFormFields(defaultValues);
  };

  // 데이터 삭제
  const handleDelete = async (rowIndex: number) => {
    try {
      const row = tableData[rowIndex];
      
      // id 필드로 삭제
      const { error: deleteError } = await supabase
        .from(activeTable)
        .delete()
        .eq('id', row.id);
      
      if (deleteError) throw deleteError;
      
      // 새로고침
      handleRefresh();
    } catch (err) {
      console.error('데이터 삭제 오류:', err);
      setError(err instanceof Error ? err.message : '데이터 삭제 중 오류가 발생했습니다');
    }
  };

  // 폼 필드 변경 핸들러
  const handleFieldChange = (fieldName: string, value: any) => {
    setFormFields(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // 데이터 추가
  const handleAdd = async () => {
    try {
      setError(null);
      
      // 현재 테이블의 스키마 가져오기
      const schema = TABLE_SCHEMAS[activeTable] || {};
      
      // 필수 필드 검증
      const requiredFields = Object.entries(schema)
        .filter(([_, config]: [string, any]) => config.required)
        .map(([fieldName]) => fieldName);
      
      const missingFields = requiredFields.filter(fieldName => 
        !formFields[fieldName] && formFields[fieldName] !== false
      );
      
      if (missingFields.length > 0) {
        setError(`다음 필드를 입력해주세요: ${missingFields.join(', ')}`);
        return;
      }
      
      // 데이터 형식 변환
      const newData: Record<string, any> = {};
      Object.entries(formFields).forEach(([key, value]) => {
        // 빈 문자열은 null로 변환
        if (value === "") {
          newData[key] = null;
        } else {
          newData[key] = value;
        }
      });
      
      // 데이터 추가
      const { error: insertError } = await supabase
        .from(activeTable)
        .insert(newData);
      
      if (insertError) throw insertError;
      
      // 성공 시 폼 초기화 및 새로고침
      resetForm();
      setShowAddForm(false);
      handleRefresh();
    } catch (err) {
      console.error('데이터 추가 오류:', err);
      setError(err instanceof Error ? err.message : '데이터 추가 중 오류가 발생했습니다');
    }
  };

  // 필드 렌더링
  const renderField = (fieldName: string, fieldConfig: FieldConfig) => {
    const { type, label, required, options, dynamicOptions: dynOptions, step } = fieldConfig;
    
    switch (type) {
      case 'text':
        return (
          <input
            type="text"
            value={formFields[fieldName] || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className="w-full p-2 border rounded text-sm focus:ring focus:ring-blue-300"
            placeholder={`${label} 입력...`}
            required={required}
          />
        );
        
      case 'textarea':
        return (
          <textarea
            value={formFields[fieldName] || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className="w-full p-2 border rounded text-sm focus:ring focus:ring-blue-300 h-24"
            placeholder={`${label} 입력...`}
            required={required}
          />
        );
        
      case 'number':
        return (
          <input
            type="number"
            value={formFields[fieldName] || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className="w-full p-2 border rounded text-sm focus:ring focus:ring-blue-300"
            placeholder={`${label} 입력...`}
            step={step || "1"}
            required={required}
          />
        );
        
      case 'date':
        return (
          <input
            type="date"
            value={formFields[fieldName] || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className="w-full p-2 border rounded text-sm focus:ring focus:ring-blue-300"
            required={required}
          />
        );
        
      case 'datetime-local':
        return (
          <input
            type="datetime-local"
            value={formFields[fieldName] || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className="w-full p-2 border rounded text-sm focus:ring focus:ring-blue-300"
            required={required}
          />
        );
        
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={formFields[fieldName] || false}
            onChange={(e) => handleFieldChange(fieldName, e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        );
        
      case 'select':
        if (dynOptions) {
          // 동적 옵션 사용 (예: 테이블에서 가져온 데이터)
          return (
            <select
              value={formFields[fieldName] || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className="w-full p-2 border rounded text-sm focus:ring focus:ring-blue-300"
              required={required}
            >
              <option value="">-- 선택하세요 --</option>
              {dynamicOptions[dynOptions]?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        } else {
          // 정적 옵션 사용
          return (
            <select
              value={formFields[fieldName] || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className="w-full p-2 border rounded text-sm focus:ring focus:ring-blue-300"
              required={required}
            >
              <option value="">-- 선택하세요 --</option>
              {options?.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        }
        
      default:
        return (
          <input
            type="text"
            value={formFields[fieldName] || ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className="w-full p-2 border rounded text-sm focus:ring focus:ring-blue-300"
            placeholder={`${label} 입력...`}
            required={required}
          />
        );
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Supabase 데이터 테스터</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setShowAddForm(true);
              resetForm();
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            데이터 추가
          </button>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            새로고침
          </button>
        </div>
      </div>

      {/* 테이블 선택 탭 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABLES.map(table => (
          <button
            key={table}
            className={`px-3 py-2 rounded-md ${
              activeTable === table 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTable(table)}
          >
            {table}
          </button>
        ))}
      </div>

      {/* 데이터 추가 폼 */}
      {showAddForm && (
        <div className="mb-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">{activeTable} 데이터 추가</h3>
            <button 
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {TABLE_SCHEMAS[activeTable] && Object.entries(TABLE_SCHEMAS[activeTable]).map(([fieldName, fieldConfig]) => (
              <div key={fieldName} className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {fieldConfig.label || fieldName}
                  {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(fieldName, fieldConfig)}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              추가하기
            </button>
          </div>
        </div>
      )}

      {/* 오류 메시지 표시 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* 데이터 표시 영역 */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-3 border-b">
          <h2 className="font-semibold">{activeTable} 테이블</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        ) : tableData.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>데이터가 없습니다</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left border-b">작업</th>
                  {Object.keys(tableData[0]).map(key => (
                    <th key={key} className="px-4 py-2 text-left border-b">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 border-b">
                      <button
                        onClick={() => handleDelete(rowIndex)}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        삭제
                      </button>
                    </td>
                    {Object.entries(row).map(([key, value], colIndex) => (
                      <td key={`${rowIndex}-${colIndex}`} className="px-4 py-2 border-b">
                        {typeof value === 'object' 
                          ? value === null 
                            ? 'null' 
                            : JSON.stringify(value).substring(0, 50) + (JSON.stringify(value).length > 50 ? '...' : '')
                          : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}