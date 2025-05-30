import Highcharts from 'highcharts';

// 타입 정의(Period, ChartDataPoint)는 JavaScript에서는 사용되지 않으므로 제거합니다.
// JSDoc을 사용하여 타입을 명시할 수 있으나, 여기서는 TypeScript 구문만 제거합니다.

/**
 * Highcharts의 차트 옵션을 생성합니다.
 * @param {string} period 현재 선택된 기간 ('daily', 'weekly', 'monthly', 'yearly')
 * @param {Array<object>} data 차트에 표시할 데이터 배열 (예: [{ date: '2024-01-01', value: 1300.0 }])
 * @param {function} onPointClick 차트의 데이터 포인트를 클릭했을 때 호출될 콜백 함수
 * @returns {object} Highcharts 차트 옵션 객체
 */
export const getChartOptions = (
  period,
  data,
  onPointClick,
  selectedPoints = [] // selectedPoints 파라미터 추가 및 기본값 설정
) => {
  // dateTimeLabelFormats는 xAxis.type이 'datetime'일 때 사용되지만,
  // 현재 xAxis.type이 'category'이므로 직접적인 영향은 없습니다.
  // 다만, Highcharts가 내부적으로 참고할 수 있으므로 구조는 유지합니다.
  let dateTimeLabelFormats = {};

  switch (period) {
    case 'daily':
      dateTimeLabelFormats = {
        day: '%Y-%m-%d',
        month: '%Y-%m',
        year: '%Y',
      };
      break;
    case 'weekly':
      dateTimeLabelFormats = {
        week: '%Y-W%W',
        month: '%Y-%m',
        year: '%Y',
      };
      break;
    case 'monthly':
      dateTimeLabelFormats = {
        month: '%Y-%m',
        year: '%Y',
      };
      break;
    case 'yearly':
      dateTimeLabelFormats = {
        year: '%Y',
      };
      break;
  }

  let periodText = '';
  switch (period) {
    case 'daily':
      periodText = '일별';
      break;
    case 'weekly':
      periodText = '주별';
      break;
    case 'monthly':
      periodText = '월별';
      break;
    case 'yearly':
      periodText = '연도별';
      break;
    default:
      periodText = period;
  }

  return {
    chart: {
      type: 'line',
      zooming: {
        mouseWheel: true,
      },
    },
    title: {
      text: `USD/KRW 환율 (${periodText})`,
    },
    xAxis: {
      type: 'datetime', // Use datetime axis for time-series data
      dateTimeLabelFormats: dateTimeLabelFormats, // Apply defined formats
      labels: {
        rotation: -45,
        style: {
          fontSize: '10px',
        },
      },
    },
    yAxis: {
      title: {
        text: '환율 (KRW)',
      },
    },
    legend: {
      enabled: false,
    },
    plotOptions: {
      series: {
        color: '#28a745', // 초록색
        marker: {
          enabled: true,
          radius: 3,
        },
        cursor: 'pointer',
        point: {
          events: {
            click: function () {
              // 'this.options.originalData'를 사용하여 원래 데이터 객체에 접근
              if (this.options && this.options.originalData) {
                onPointClick(this.options.originalData);
              }
            },
          },
        },
      },
    },
    series: [
      {
        name: 'USD/KRW',
        type: 'line',
        data: data.map(d => {
          const isSelected = selectedPoints.some(
            (sp) => sp.date === d.date && sp.value === d.value
          );
          let timestamp;
          if (period === 'daily') {
            timestamp = new Date(d.date).getTime();
          } else if (period === 'weekly') {
            const [year, weekPart] = d.date.split('-W');
            if (year && weekPart) {
                const weekNum = parseInt(weekPart);
                const jan4 = new Date(parseInt(year), 0, 4);
                const firstMondayOfYear = new Date(jan4.setDate(jan4.getDate() - (jan4.getDay() || 7) + 1));
                timestamp = new Date(firstMondayOfYear.setDate(firstMondayOfYear.getDate() + (weekNum - 1) * 7)).getTime();
            } else {
                timestamp = new Date(d.date).getTime();
            }
          } else if (period === 'monthly') {
            timestamp = new Date(d.date + '-01').getTime();
          } else if (period === 'yearly') {
            timestamp = new Date(d.date + '-01-01').getTime();
          } else {
            timestamp = new Date(d.date).getTime();
          }
          return {
            x: timestamp,
            y: d.value,
            marker: {
              enabled: true,
              radius: isSelected ? 6 : 3,
              fillColor: isSelected ? 'yellow' : '#28a745',
              lineWidth: isSelected ? 2 : 0,
              lineColor: isSelected ? Highcharts.getOptions().colors[0] : '#28a745', // Or a specific border color for selected
            },
            originalData: d // Store original data object with the point
          };
        }),
      },
    ],
    tooltip: {
      formatter: function () {
        // For datetime axis, this.x is the timestamp. Format it.
        // Highcharts.dateFormat is available if Highcharts is globally available or imported.
        // Assuming Highcharts is available in this scope.
        let formattedDate = Highcharts.dateFormat('%Y-%m-%d', this.x);
        if (period === 'weekly') {
            formattedDate = Highcharts.dateFormat('%Y-W%W', this.x);
        } else if (period === 'monthly') {
            formattedDate = Highcharts.dateFormat('%Y-%m', this.x);
        } else if (period === 'yearly') {
            formattedDate = Highcharts.dateFormat('%Y', this.x);
        }
        return `<b>${formattedDate}</b><br/>환율: ${this.y}`;
      }
    },
  };
};
