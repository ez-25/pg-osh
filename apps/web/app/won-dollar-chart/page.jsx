'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CurrencyChart from './CurrencyChart'; // 이제 CurrencyChart.jsx를 가리킵니다.
import CurrencyTable from './CurrencyTable'; // 이제 CurrencyTable.jsx를 가리킵니다.
import ComparisonTable from './ComparisonTable'; // 이제 ComparisonTable.jsx를 가리킵니다.
import { getChartOptions } from './hooks/chartOptions'; // 이제 chartOptions.js를 가리킵니다.
import { fetchCurrencyData } from './hooks/apiService'; // 이제 apiService.js를 가리킵니다.

// 타입 정의(Period, ChartDataPoint, ComparisonItem)는 JavaScript에서는 사용되지 않으므로 제거합니다.
// JSDoc을 사용하여 타입을 명시할 수 있으나, 여기서는 TypeScript 구문만 제거합니다.

/**
 * 원/달러 환율 차트 페이지를 위한 메인 React 컴포넌트입니다.
 * 이 컴포넌트는 기간 선택, 차트 표시, 데이터 테이블, 데이터 비교 기능을 관리합니다.
 */
export default function WonDollarChartPage() { // 함수 이름 변경 제안 (선택 사항, 여기서는 유지)
  const [selectedPeriod, setSelectedPeriod] = useState('daily'); // 타입 어노테이션 제거
  const [chartData, setChartData] = useState([]); // 타입 어노테이션 제거
  const [selectedPoints, setSelectedPoints] = useState([]); // 타입 어노테이션 제거
  const [comparisonData, setComparisonData] = useState(null); // 변경: 단일 객체 또는 null
  const [isLoading, setIsLoading] = useState(true); // 타입 어노테이션 제거
  const [error, setError] = useState(null); // 타입 어노테이션 제거

  // 데이터 가져오기 로직
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      setChartData([]); // 이전 데이터 지우기

      try {
        const data = await fetchCurrencyData(selectedPeriod);
        setChartData(data);
      } catch (err) {
        console.error("데이터 가져오기 실패:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    setSelectedPoints([]); // 기간 변경 시 선택된 포인트 초기화
    setComparisonData(null); // 변경: 기간 변경 시 비교 데이터 초기화
  }, [selectedPeriod]);

  /**
   * 차트에서 데이터 포인트를 클릭했을 때 호출되는 콜백 함수입니다.
   * 두 개의 포인트가 선택되면 비교 데이터를 생성합니다.
   * @param {object} pointData 클릭된 포인트의 데이터 (예: { date: '2024-01-01', value: 1300.0 })
   */
  const handlePointClick = useCallback((pointData) => { // 타입 어노테이션 제거
    setSelectedPoints((prevSelectedPoints) => {
      // 이미 선택된 포인트인지 확인 (date와 value 모두 비교)
      const isAlreadySelected = prevSelectedPoints.some(
        (p) => p.date === pointData.date && p.value === pointData.value
      );

      if (isAlreadySelected) {
        // 이미 선택된 포인트면, 해당 포인트를 선택 해제 (선택적으로 구현 가능, 여기서는 중복 선택 방지)
        // return prevSelectedPoints.filter(p => !(p.date === pointData.date && p.value === pointData.value));
        return prevSelectedPoints; // 중복 선택 방지
      }

      const newSelectedPoints = [...prevSelectedPoints, pointData];
      if (newSelectedPoints.length === 2) {
        const p1 = newSelectedPoints[0];
        const p2 = newSelectedPoints[1];
        if (p1 && p2) {
          const diff = ((p2.value - p1.value) / p1.value) * 100;
          // ComparisonItem 객체 생성 (타입 정의는 제거됨)
          const newComparison = {
            date1: p1.date,
            value1: p1.value,
            date2: p2.date,
            value2: p2.value,
            differencePercent: `${diff.toFixed(2)}%`,
            absoluteDifference: (p2.value - p1.value).toFixed(2) // 절대 차이 추가
          };
          // setComparisonData((prev) => [...prev, newComparison]); // 변경 전
          setComparisonData(newComparison); // 변경: 새 비교 데이터로 교체
        }
        return []; // 다음 비교를 위해 선택 초기화
      }
      return newSelectedPoints;
    });
  }, []);

  const chartOptions = getChartOptions(selectedPeriod, chartData, handlePointClick, selectedPoints);

  return (
    <div style={{ padding: '20px' }}>
      <h1>원/달러 환율 차트</h1> {/* 제목 한글로 변경 */}
      <div>
        <button onClick={() => setSelectedPeriod('daily')} disabled={selectedPeriod === 'daily'}>
          일별
        </button>
        <button onClick={() => setSelectedPeriod('weekly')} disabled={selectedPeriod === 'weekly'}>
          주별
        </button>
        <button onClick={() => setSelectedPeriod('monthly')} disabled={selectedPeriod === 'monthly'}>
          월별
        </button>
        <button onClick={() => setSelectedPeriod('yearly')} disabled={selectedPeriod === 'yearly'}>
          연도별
        </button>
      </div>

      {isLoading && <p>차트 데이터를 불러오는 중...</p>}
      {error && <p style={{ color: 'red' }}>오류: {error}</p>}
      {!isLoading && !error && chartData.length > 0 && (
        <CurrencyChart options={chartOptions} />
      )}
      {!isLoading && !error && chartData.length === 0 && (
         <p>선택된 기간에 대한 데이터가 없습니다.</p>
      )}

      {/*
      <h2>데이터 테이블 ({
        selectedPeriod === 'daily' ? '일별' :
        selectedPeriod === 'weekly' ? '주별' :
        selectedPeriod === 'monthly' ? '월별' :
        selectedPeriod === 'yearly' ? '연도별' : ''
      })</h2>
      {!isLoading && !error && chartData.length > 0 ? (
        <CurrencyTable data={chartData} />
      ) : (
        !isLoading && !error && <p>테이블에 표시할 데이터가 없습니다.</p>
      )}
      */}

      {comparisonData && ( // 변경: comparisonData가 null이 아닐 때만 렌더링
        <>
          <h2>비교 결과</h2>
          <ComparisonTable data={comparisonData} />
        </>
      )}
    </div>
  );
}
