import { Component, OnInit, signal } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgIf, NgFor, DecimalPipe, DatePipe, NgClass } from '@angular/common';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexStroke, ApexDataLabels, ApexGrid, ApexTitleSubtitle, ApexMarkers, ApexYAxis, ApexTooltip, ApexFill, ApexLegend } from 'ng-apexcharts';
import { MetricsService, AdminMetrics, MonthlyStat } from '../../core/services/metrics.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  title: ApexTitleSubtitle;
  markers: ApexMarkers;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill;
  legend: ApexLegend;
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NgApexchartsModule, NgIf, NgFor, DecimalPipe, DatePipe, NgClass],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  metrics = signal<AdminMetrics | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private metricsService: MetricsService) {}

  ngOnInit() {
    this.loadMetrics();
  }

  loadMetrics() {
    this.loading.set(true);
    this.error.set(null);

    this.metricsService.getAdminMetrics().subscribe({
      next: (data: AdminMetrics) => {
        this.metrics.set(data);
        this.updateChartData(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set('Failed to load admin metrics');
        this.loading.set(false);
        console.error('Error loading admin metrics:', err);
      }
    });
  }

  public chartOptions: ChartOptions = {
    series: [
      {
        name: 'Parcels',
        data: []
      }
    ],
    chart: {
      type: 'line',
      height: 380,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    xaxis: {
      categories: ['Jul 19', 'Jul 20', 'Jul 21', 'Jul 22', 'Jul 23', 'Jul 24', 'Jul 25'],
      labels: { style: { colors: '#f97316', fontWeight: 600 } }
    },
    stroke: {
      curve: 'smooth',
      width: 4,
      colors: ['#f97316']
    },
    dataLabels: { enabled: false },
    grid: { borderColor: '#fde68a', row: { colors: ['#fff', 'transparent'], opacity: 0.5 } },
    title: { text: '', align: 'left' },
    markers: { size: 5, colors: ['#f97316'], strokeColors: '#fff', strokeWidth: 2 },
    yaxis: { labels: { style: { colors: '#6b7280' } } },
    tooltip: { enabled: true },
    fill: { type: 'gradient', gradient: { shade: 'light', type: 'vertical', gradientToColors: ['#fdba74'], stops: [0, 100] } },
    legend: { show: false }
  };

  updateChartData(metrics: AdminMetrics) {
    // Update chart with monthly stats data
    const monthlyData = metrics.monthlyStats;
    if (monthlyData && monthlyData.length > 0) {
      const categories = monthlyData.map((stat: MonthlyStat) => {
        const date = new Date(stat.month + '-01');
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      });
      const data = monthlyData.map((stat: MonthlyStat) => stat.parcels);

      this.chartOptions = {
        ...this.chartOptions,
        series: [{ name: 'Parcels', data }],
        xaxis: { ...this.chartOptions.xaxis, categories }
      };
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  calculateOnTimeRate(): string {
    const metrics = this.metrics();
    if (!metrics || metrics.statusDistribution.total === 0) return '0%';

    const delivered = metrics.statusDistribution.delivered;
    const total = metrics.statusDistribution.total;
    const rate = (delivered / total) * 100;
    return `${rate.toFixed(1)}%`;
  }

  calculateAvgDeliveryTime(): string {
    // This would need additional data from backend
    // For now, return a placeholder
    return '1.8 days';
  }

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }
}