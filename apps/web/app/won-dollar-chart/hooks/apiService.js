// apps/web/app/won-dollar-chart/apiService.js

/**
 * @file 환율 데이터 API 연동 및 데이터 처리 서비스 모듈
 */
// JSDoc을 사용하여 타입을 명시할 수 있으나, 여기서는 TypeScript 구문만 제거합니다.
// export type Period = 'daily' | 'weekly' | 'monthly';
// export type ChartDataPoint = { date: string; value: number };

/**
 * 날짜 객체를 'YYYY-MM-DD' 형식의 문자열로 변환합니다.
 * @param {Date} date 변환할 Date 객체
 * @returns {string} 'YYYY-MM-DD' 형식의 날짜 문자열
 */
const formatDate = (date) => {
  const parts = date.toISOString().split('T');
  return parts[0]; 
};

/**
 * 날짜 객체로부터 'YYYY-Www' 형식의 주차 문자열을 반환합니다. (예: '2024-W23')
 * ISO 8601 주차 계산 방식을 따릅니다.
 * @param {Date} date Date 객체
 * @returns {string} 'YYYY-Www' 형식의 주차 문자열
 */
const getWeekNumberString = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // 일요일(0)을 주의 마지막 날(7)로 조정
  const dayNum = d.getUTCDay() || 7;
  // 해당 주의 목요일로 날짜를 설정 (ISO 8601 정의에 따라)
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // 연초부터 해당 목요일까지의 일 수를 7로 나누어 주차 계산
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

/**
 * 선택된 기간에 따라 Frankfurter API에서 USD/KRW 환율 데이터를 가져오고 처리합니다.
 * @param {string} period 데이터를 가져올 기간 ('daily', 'weekly', 'monthly', 'yearly')
 * @returns {Promise<Array<object>>} 처리된 차트 데이터 포인트 배열 (예: [{ date: '2024-01-01', value: 1300.0 }])
 * @throws API 호출 실패 또는 데이터 처리 중 오류 발생 시 에러를 throw 합니다.
 */
export const fetchCurrencyData = async (period) => {
  const today = new Date();
  let startDate;
  let endDate = today;
  let apiUrl = '';

  switch (period) {
    case 'daily':
      startDate = new Date();
      startDate.setDate(today.getDate() - 30); // 최근 30일 데이터
      apiUrl = `https://api.frankfurter.app/${formatDate(startDate)}..${formatDate(endDate)}?from=USD&to=KRW`;
      break;
    case 'weekly':
      startDate = new Date();
      startDate.setMonth(today.getMonth() - 6); // 최근 6개월 데이터 (주별 집계용)
      apiUrl = `https://api.frankfurter.app/${formatDate(startDate)}..${formatDate(endDate)}?from=USD&to=KRW`;
      break;
    case 'monthly':
      startDate = new Date();
      startDate.setFullYear(today.getFullYear() - 2); // 최근 2년 데이터 (월별 집계용)
      apiUrl = `https://api.frankfurter.app/${formatDate(startDate)}..${formatDate(endDate)}?from=USD&to=KRW`;
      break;
    case 'yearly':
      startDate = new Date();
      startDate.setFullYear(today.getFullYear() - 10); // 최근 10년 데이터 (연도별 집계용)
      apiUrl = `https://api.frankfurter.app/${formatDate(startDate)}..${formatDate(endDate)}?from=USD&to=KRW`;
      break;
    default:
      // JavaScript에서는 타입 제약이 없으므로, 런타임 에러 방지를 위해 기본값을 설정하거나 에러를 명확히 할 수 있습니다.
      throw new Error('유효하지 않은 기간이 선택되었습니다.');
  }

  const response = await fetch(apiUrl);
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // 응답 본문이 JSON이 아니거나 파싱 실패 시 기존 메시지 사용
    }
    throw new Error(errorMessage);
  }
  const data = await response.json();

  if (!data.rates) {
    throw new Error('API 응답에서 환율 데이터를 찾을 수 없습니다.');
  }

  let processedData = [];
  const rates = data.rates;
  // 날짜를 기준으로 오름차순 정렬
  const sortedDates = Object.keys(rates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  if (period === 'daily') {
    processedData = sortedDates.map(date => {
      if (rates[date] && typeof rates[date].KRW === 'number') {
        return {
          date: date,
          value: rates[date].KRW,
        };
      }
      return null;
    }).filter(Boolean); // Filter out entries with missing or invalid KRW data
  } else if (period === 'weekly') {
    const weeklyData = {}; // { [week: string]: ChartDataPoint[] } -> 일반 객체로 변경
    sortedDates.forEach(dateStr => {
      const dateObj = new Date(dateStr);
      const weekStr = getWeekNumberString(dateObj);
      // Ensure KRW data exists and is a number before processing
      if (rates[dateStr] && typeof rates[dateStr].KRW === 'number') {
        if (!weeklyData[weekStr]) {
          weeklyData[weekStr] = [];
        }
        weeklyData[weekStr].push({ date: dateStr, value: rates[dateStr].KRW });
      }
    });

    processedData = Object.keys(weeklyData).map(weekStr => {
      const weekPoints = weeklyData[weekStr];
      // 해당 주의 마지막 데이터 포인트를 사용
      if (weekPoints && weekPoints.length > 0) {
        const lastPointOfWeek = weekPoints[weekPoints.length - 1];
        if (lastPointOfWeek) {
          return { date: weekStr, value: lastPointOfWeek.value };
        }
      }
      return null; 
    }).filter(Boolean); // null 값 제거 (타입 단언 제거)
    processedData.sort((a,b) => a.date.localeCompare(b.date)); // 주차 문자열 기준으로 정렬
  } else if (period === 'monthly') {
    const monthlyData = {}; // { [month: string]: ChartDataPoint[] } -> 일반 객체로 변경
    sortedDates.forEach(dateStr => {
      const monthStr = dateStr.substring(0, 7); // 'YYYY-MM' 형식
      // Ensure KRW data exists and is a number before processing
      if (rates[dateStr] && typeof rates[dateStr].KRW === 'number') {
        if (!monthlyData[monthStr]) {
          monthlyData[monthStr] = [];
        }
        monthlyData[monthStr].push({ date: dateStr, value: rates[dateStr].KRW });
      }
    });

    processedData = Object.keys(monthlyData).map(monthStr => {
      const monthPoints = monthlyData[monthStr];
      // 해당 월의 마지막 데이터 포인트를 사용
      if (monthPoints && monthPoints.length > 0) {
        const lastPointOfMonth = monthPoints[monthPoints.length - 1];
        if (lastPointOfMonth) {
          return { date: monthStr, value: lastPointOfMonth.value };
        }
      }
      return null;
    }).filter(Boolean); // null 값 제거 (타입 단언 제거)
    processedData.sort((a,b) => a.date.localeCompare(b.date)); // 월 문자열 기준으로 정렬
  } else if (period === 'yearly') {
    const yearlyData = {}; // { [year: string]: ChartDataPoint[] } -> 일반 객체로 변경
    sortedDates.forEach(dateStr => {
      const yearStr = dateStr.substring(0, 4); // 'YYYY' 형식
      // Ensure KRW data exists and is a number before processing
      if (rates[dateStr] && typeof rates[dateStr].KRW === 'number') {
        if (!yearlyData[yearStr]) {
          yearlyData[yearStr] = [];
        }
        yearlyData[yearStr].push({ date: dateStr, value: rates[dateStr].KRW });
      }
    });

    processedData = Object.keys(yearlyData).map(yearStr => {
      const yearPoints = yearlyData[yearStr];
      // 해당 연도의 마지막 데이터 포인트를 사용
      if (yearPoints && yearPoints.length > 0) {
        const lastPointOfYear = yearPoints[yearPoints.length - 1];
        if (lastPointOfYear) {
          return { date: yearStr, value: lastPointOfYear.value };
        }
      }
      return null;
    }).filter(Boolean); 
    processedData.sort((a,b) => a.date.localeCompare(b.date)); // 연도 문자열 기준으로 정렬
  }
  return processedData;
};
