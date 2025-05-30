'use client';

import React from 'react';

// 타입 정의(ComparisonItem, ComparisonTableProps)는 JavaScript에서는 사용되지 않으므로 제거합니다.
// './page'에서의 ComparisonItem 임포트도 제거합니다.
// JSDoc을 사용하여 타입을 명시할 수 있으나, 여기서는 TypeScript 구문만 제거합니다.

/**
 * 두 데이터 포인트 간의 비교 결과를 테이블 형태로 표시하는 React 컴포넌트입니다.
 * @param {object} props 컴포넌트 속성
 * @param {object} props.data 테이블에 표시할 단일 비교 데이터 객체.
 * 객체는 { date1, value1, date2, value2, differencePercent, absoluteDifference } 형태를 가집니다.
 */
const ComparisonTable = ({ data }) => {
  if (!data) { // 변경: data가 null 또는 undefined이면 아무것도 렌더링하지 않음
    return null;
  }

  // 이제 data는 단일 객체이므로 map을 사용하지 않습니다.
  const item = data;

  return (
    <table style={{ width: '100%', marginTop: '30px', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>선택 1</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>선택 2</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>환율 변동 (KRW)</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>변동률 (%)</th>
        </tr>
      </thead>
      <tbody>
        {/* 단일 행으로 변경 */}
        <tr key={`${item.date1}-${item.date2}`}>
          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{`${item.date1} (${item.value1.toLocaleString()})`}</td>
          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{`${item.date2} (${item.value2.toLocaleString()})`}</td>
          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.absoluteDifference}</td>
          <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.differencePercent}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default ComparisonTable;
