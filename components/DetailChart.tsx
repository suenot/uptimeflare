import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  TimeScale,
} from 'chart.js'
import 'chartjs-adapter-moment'
import { MonitorState, MonitorTarget } from '@/types/config'
import { codeToCountry } from '@/util/iata'
import { useTranslation } from 'react-i18next'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  TimeScale
)

export default function DetailChart({
  monitor,
  state,
  appearance = 'default',
}: {
  monitor: MonitorTarget
  state: MonitorState
  appearance?: 'default' | 'status'
}) {
  const { t } = useTranslation('common')
  const statusAppearance = appearance === 'status'
  const latencyData = state.latency[monitor.id].map((point) => ({
    x: point.time * 1000,
    y: point.ping,
    loc: point.loc,
  }))

  let data = {
    datasets: [
      {
        data: latencyData,
        borderColor: 'rgb(112, 119, 140)',
        borderWidth: 2,
        radius: 0,
        cubicInterpolationMode: 'monotone' as const,
        tension: 0.4,
      },
    ],
  }

  let options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    animation: {
      duration: 0,
    },
    plugins: {
      tooltip: {
        backgroundColor: statusAppearance ? '#101214' : undefined,
        borderColor: statusAppearance ? '#1e2225' : undefined,
        borderWidth: statusAppearance ? 1 : undefined,
        titleColor: statusAppearance ? '#e7e9ea' : undefined,
        bodyColor: statusAppearance ? '#e7e9ea' : undefined,
        callbacks: {
          label: (item: any) => {
            if (item.parsed.y) {
              return `${item.parsed.y}ms (${codeToCountry(item.raw.loc)})`
            }
          },
        },
      },
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: t('Response times'),
        align: 'start' as const,
        color: statusAppearance ? '#e7e9ea' : undefined,
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        ticks: {
          source: 'auto' as const,
          maxRotation: 0,
          autoSkip: true,
          color: statusAppearance ? '#8b949e' : undefined,
        },
        grid: { color: statusAppearance ? '#1e2225' : undefined },
      },
      y: {
        ticks: { color: statusAppearance ? '#8b949e' : undefined },
        grid: { color: statusAppearance ? '#1e2225' : undefined },
      },
    },
  }

  return (
    <div style={{ height: '150px' }}>
      <Line options={options} data={data} />
    </div>
  )
}
