import { Component } from '@angular/core';
@Component({
  templateUrl: 'chartjs.component.html'
})
export class ChartJSComponent {
  // lineChart
  public lineChartData: Array<any> = [
    {data: [75, 69, 90, 91, 86, 75, 60], label: 'Series A'},
    {data: [38, 58, 50, 29, 96, 37, 100], label: 'Series B'},
    {data: [28, 58, 87, 19, 110, 37, 50], label: 'Series C'}
  ];
  public lineChartLabels: Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions: any = {
    animation: true,
    responsive: true,
    title: {
      display: true,
      text: 'Sales Trend 2025',
      fontSize: 16
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true
    }
  };
  public lineChartColours: Array<any> = [
    { // blue
      backgroundColor: 'rgba(77,166,253,0.2)',
      borderColor: 'rgba(77,166,253,1)',
      pointBackgroundColor: 'rgba(77,166,253,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,166,253,0.8)'
    },
    { // green
      backgroundColor: 'rgba(56,193,114,0.2)',
      borderColor: 'rgba(56,193,114,1)',
      pointBackgroundColor: 'rgba(56,193,114,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(56,193,114,1)'
    },
    { // purple
      backgroundColor: 'rgba(153,102,255,0.2)',
      borderColor: 'rgba(153,102,255,1)',
      pointBackgroundColor: 'rgba(153,102,255,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(153,102,255,0.8)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  // barChart
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    title: {
      display: true,
      text: 'Annual Performance 2019-2025',
      fontSize: 16
    },
    legend: {
      position: 'top',
    }
  };
  public barChartLabels: string[] = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  public barChartType = 'bar';
  public barChartLegend = true;
  public barChartData: any[] = [
    {data: [65, 59, 80, 81, 86, 95, 110], label: 'Revenue', backgroundColor: 'rgba(75, 192, 192, 0.6)'},
    {data: [28, 48, 40, 49, 76, 87, 120], label: 'Profit', backgroundColor: 'rgba(255, 159, 64, 0.6)'}
  ];
  // Doughnut
  public doughnutChartLabels: string[] = ['Online Sales', 'In-Store Sales', 'Mail-Order Sales'];
  public doughnutChartData: number[] = [450, 550, 200];
  public doughnutChartType = 'doughnut';
  public doughnutChartOptions: any = {
    responsive: true,
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Sales Distribution 2025',
      fontSize: 16
    },
    plugins: {
      colorschemes: {
        scheme: 'brewer.Paired12'
      }
    }
  };
  // Radar
  public radarChartLabels: string[] = ['Marketing', 'Sales', 'Development', 'Customer Support', 'Quality', 'Administration', 'Finance'];
  public radarChartData: any = [
    {data: [75, 69, 90, 91, 86, 75, 60], label: '2025 Q1', backgroundColor: 'rgba(255, 99, 132, 0.2)', borderColor: 'rgb(255, 99, 132)'},
    {data: [38, 58, 50, 69, 96, 77, 90], label: '2025 Q2', backgroundColor: 'rgba(54, 162, 235, 0.2)', borderColor: 'rgb(54, 162, 235)'}
  ];
  public radarChartType = 'radar';
  public radarChartOptions: any = {
    responsive: true,
    title: {
      display: true,
      text: 'Department Performance 2025',
      fontSize: 16
    }
  };
  // Pie
  public pieChartLabels: string[] = ['E-commerce', 'Retail Stores', 'Direct Sales'];
  public pieChartData: number[] = [400, 600, 300];
  public pieChartType = 'pie';
  public pieChartOptions: any = {
    responsive: true,
    legend: {
      position: 'right',
    },
    title: {
      display: true,
      text: 'Revenue Sources 2025',
      fontSize: 16
    }
  };
  // PolarArea
  public polarAreaChartLabels: string[] = ['Digital Marketing', 'Traditional Marketing', 'Partner Marketing', 'Social Media', 'Referrals'];
  public polarAreaChartData: number[] = [350, 450, 200, 380, 320];
  public polarAreaLegend = true;
  public polarAreaChartType = 'polarArea';
  public polarAreaChartOptions: any = {
    responsive: true,
    legend: {
      position: 'right',
    },
    title: {
      display: true,
      text: 'Marketing Effectiveness 2025',
      fontSize: 16
    }
  };
  // events
  public chartClicked(e: any): void {
    console.log(e);
  }
  public chartHovered(e: any): void {
    console.log(e);
  }
}
