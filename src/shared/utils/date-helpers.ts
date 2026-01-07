import { format as dateFnsFormat, parseISO, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * Get the current date in YYYY-MM-DD format
 */
export const getCurrentDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get tomorrow's date in YYYY-MM-DD format
 */
export const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 안전한 날짜 형식 변환 함수 
 * 다양한 형식의 날짜 문자열을 처리하고 지정된 형식으로 반환
 * 
 * @param dateString 날짜 문자열
 * @param formatPattern 원하는 출력 형식 (기본값: 'yyyy-MM-dd')
 * @returns 형식화된 날짜 문자열 또는 오류 시 원본 문자열
 */
export const formatDate = (dateString?: string, formatPattern = 'yyyy-MM-dd'): string => {
  try {
    // 날짜가 없으면 빈 문자열 반환
    if (!dateString) return '';
    
    // 커스텀 형식 처리 ('2025-05-11-오전 09:00')
    if (dateString.includes('-오전') || dateString.includes('-오후')) {
      const parts = dateString.split('-');
      if (parts.length >= 4) {
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        const timePart = parts.slice(3).join('-');
        
        // formatPattern이 기본 날짜만 요청하는 경우
        if (formatPattern === 'yyyy-MM-dd') {
          return `${year}-${month}-${day}`;
        }
        
        // 한글 날짜 형식 요청 시
        if (formatPattern.includes('M월')) {
          return `${year}년 ${month}월 ${day}일 ${timePart}`;
        }
        
        return `${year}-${month}-${day} ${timePart}`;
      }
    }
    
    // ISO 형식 또는 표준 Date 객체가 처리 가능한 형식 처리
    let date: Date;
    
    // ISO 문자열인 경우 parseISO 사용
    if (typeof dateString === 'string' && dateString.includes('T')) {
      date = parseISO(dateString);
    } else {
      // 일반 날짜 문자열
      date = new Date(dateString);
    }
    
    // 유효한 날짜인지 확인
    if (!isValid(date)) {
      console.warn('유효하지 않은 날짜:', dateString);
      return dateString;
    }
    
    // date-fns 사용하여 형식화
    return dateFnsFormat(date, formatPattern, { locale: ko });
  } catch (error) {
    console.error('날짜 형식 변환 오류:', error);
    return dateString || '';
  }
};

/**
 * 날짜를 한글 형식으로 변환 (예: 5월 6일 (월요일) 14:30)
 */
export const formatKoreanDate = (dateString?: string): string => {
  return formatDate(dateString, 'M월 d일 (EEEE) HH:mm');
};

/**
 * 날짜를 간단한 형식으로 변환 (예: 2025-05-06)
 */
export const formatSimpleDate = (dateString?: string): string => {
  return formatDate(dateString, 'yyyy-MM-dd');
};

/**
 * 날짜와 시간 형식으로 변환 (예: 2025-05-06 14:30)
 */
export const formatDateTime = (dateString?: string): string => {
  return formatDate(dateString, 'yyyy-MM-dd HH:mm');
};
