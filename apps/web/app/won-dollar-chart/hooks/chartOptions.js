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
  onPointClick
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
              // 'this' is the Highcharts Point object. 'this.x' is the timestamp.
              // Find the original data point by comparing timestamps.
              // Need to parse d.date to a timestamp for comparison.
              const clickedTimestamp = this.x;
              const originalPoint = data.find(d => {
                let pointTimestamp;
                if (period === 'daily') {
                  pointTimestamp = new Date(d.date).getTime();
                } else if (period === 'weekly') {
                  const [year, weekPart] = d.date.split('-W');
                  if (year && weekPart) {
                    const weekNum = parseInt(weekPart);
                    // Get the Monday of that week (ISO 8601 week date)
                    const jan4 = new Date(parseInt(year), 0, 4); // Jan 4th is always in week 1
                    const firstMonday = new Date(jan4.setDate(jan4.getDate() - (jan4.getDay() || 7) + 1));
                    pointTimestamp = new Date(firstMonday.setDate(firstMonday.getDate() + (weekNum - 1) * 7)).getTime();
                  } else {
                     pointTimestamp = new Date(d.date).getTime(); // Fallback if format is unexpected
                  }
                } else if (period === 'monthly') {
                  pointTimestamp = new Date(d.date + '-01').getTime(); // First day of the month
                } else if (period === 'yearly') {
                  pointTimestamp = new Date(d.date + '-01-01').getTime(); // First day of the year
                } else {
                  pointTimestamp = new Date(d.date).getTime(); // Default fallback
                }
                return pointTimestamp === clickedTimestamp && d.value === this.y;
              });

              if (originalPoint) {
                onPointClick(originalPoint);
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
          let timestamp;
          if (period === 'daily') {
            timestamp = new Date(d.date).getTime();
          } else if (period === 'weekly') {
            // 'YYYY-Www' format. Get timestamp for the start of that week (Monday).
            const [year, weekPart] = d.date.split('-W');
            if (year && weekPart) {
                const weekNum = parseInt(weekPart);
                // Jan 4th is always in week 1. Find Monday of week 1.
                const jan4 = new Date(parseInt(year), 0, 4);
                const firstMondayOfYear = new Date(jan4.setDate(jan4.getDate() - (jan4.getDay() || 7) + 1));
                // Add (weekNum - 1) weeks to the first Monday.
                timestamp = new Date(firstMondayOfYear.setDate(firstMondayOfYear.getDate() + (weekNum - 1) * 7)).getTime();
            } else {
                // Fallback for unexpected week format, though data should be consistent
                timestamp = new Date(d.date).getTime();
            }
          } else if (period === 'monthly') {
            timestamp = new Date(d.date + '-01').getTime(); // Use first day of the month
          } else if (period === 'yearly') {
            timestamp = new Date(d.date + '-01-01').getTime(); // Use first day of the year
          } else {
            timestamp = new Date(d.date).getTime(); // Fallback, should not happen
          }
          return [timestamp, d.value];
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
