'use client';

import React from 'react';

// 타입 정의(ChartDataPoint, CurrencyTableProps)는 JavaScript에서는 사용되지 않으므로 제거합니다.
// JSDoc을 사용하여 타입을 명시할 수 있으나, 여기서는 TypeScript 구문만 제거합니다.

/**
 * 환율 데이터를 테이블 형태로 표시하는 React 컴포넌트입니다.
 * 이전 데이터 대비 변화율도 함께 표시합니다.
 * @param {object} props 컴포넌트 속성
 * @param {Array<object>} props.data 테이블에 표시할 데이터 배열 (예: [{ date: '2024-01-01', value: 1300.0 }])
 */
const CurrencyTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>테이블에 표시할 데이터가 없습니다.</p>;
  }

  return (
    <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>날짜</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>환율 (KRW)</th>
          <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>변동률 (%)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => {
          let changePercent = null; // string | null -> null
          if (index > 0) {
            const prevItem = data[index - 1];
            if (prevItem && prevItem.value !== 0) {
              const change = ((item.value - prevItem.value) / prevItem.value) * 100;
              changePercent = change.toFixed(2) + '%';
            } else {
              changePercent = 'N/A'; // 변동 계산 불가
            }
          }
          return (
            <tr key={item.date}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.date}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.value.toLocaleString()}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {index === 0 ? '-' : changePercent}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default CurrencyTable;
