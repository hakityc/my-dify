import ReactECharts from 'echarts-for-react'
import type { DocItem } from '@/types/document'

interface DocumentStatisticsProps {
  documents: DocItem[]
}

export function DocumentStatistics({ documents }: DocumentStatisticsProps) {
  const searchCountOption = {
    title: {
      text: '文档检索次数统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: documents.map(doc => doc.docName),
      axisLabel: {
        interval: 0,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '检索次数'
    },
    series: [
      {
        data: documents.map(doc => doc.statistics.searchCount),
        type: 'bar',
        color: '#155aef'
      }
    ],
    grid: {
      bottom: 100
    }
  }

  const hitRateOption = {
    title: {
      text: '文档命中率统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: documents.map(doc => ({
          name: doc.docName,
          value: (doc.statistics.hitRate * 100).toFixed(1)
        })),
        label: {
          formatter: '{b}: {c}%'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <ReactECharts option={searchCountOption} style={{ height: '400px' }} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <ReactECharts option={hitRateOption} style={{ height: '400px' }} />
        </div>
      </div>
    </div>
  )
}