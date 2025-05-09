'use client';

import React from 'react';

// 타입 정의(ComparisonItem, ComparisonTableProps)는 JavaScript에서는 사용되지 않으므로 제거합니다.
// './page'에서의 ComparisonItem 임포트도 제거합니다.
// JSDoc을 사용하여 타입을 명시할 수 있으나, 여기서는 TypeScript 구문만 제거합니다.

/**
 * 두 데이터 포인트 간의 비교 결과를 테이블 형태로 표시하는 React 컴포넌트입니다.
 * @param {object} props 컴포넌트 속성
 * @param {Array<object>} props.data 테이블에 표시할 비교 데이터 배열.
 * 각 객체는 { date1, value1, date2, value2, differencePercent } 형태를 가집니다.
 */
const ComparisonTable = ({ data }) => {
  if (!data || data.length === 0) {
    return null; // 비교 데이터가 없으면 아무것도 렌더링하지 않음
  }

  return (
    <table style={{ width: '100%', marginTop: '30px', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>날짜 1</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>환율 1 (KRW)</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>날짜 2</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>환율 2 (KRW)</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>변동률 (%)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={`${item.date1}-${item.date2}-${index}`}>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.date1}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.value1.toLocaleString()}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.date2}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.value2.toLocaleString()}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.differencePercent}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ComparisonTable;
