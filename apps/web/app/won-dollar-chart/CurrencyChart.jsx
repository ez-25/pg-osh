'use client';

import React from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';

// Optional: Load Highcharts modules if needed, e.g., for stock charts, maps, etc.
// import HC_stock from 'highcharts/modules/stock';
// if (typeof Highcharts === 'object') {
//   HC_stock(Highcharts);
// }

/**
 * Highcharts를 사용하여 환율 차트를 렌더링하는 React 컴포넌트입니다.
 * @param {object} props 컴포넌트 속성
 * @param {object} props.options Highcharts 차트 옵션 객체
 */
const CurrencyChart = ({ options }) => {
  return (
    <div style={{ marginTop: '20px', marginBottom: '20px' }}>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default CurrencyChart;
