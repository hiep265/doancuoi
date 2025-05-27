import { Component, OnInit, ViewChild } from "@angular/core";
import * as signalR from "@microsoft/signalr";
import { ChartThirdService } from "./chart-third.service";
import { ChartOptions, ChartType, ChartDataSets } from "chart.js";
import { Label } from "ng2-charts";
@Component({
  selector: "app-chart-third",
  templateUrl: "./chart-third.component.html",
  styleUrls: ["./chart-third.component.scss"],
})
export class ChartThirdComponent implements OnInit {
  soLuongTon: any;
  errorMessage: any;
  // Specifies the path of the RDL report file
  public reportPath: string;
  serviceUrl: string;
  constructor(private service: ChartThirdService) {
    // this.serviceUrl = 'https://demos.boldreports.com/services/api/ReportViewer';
    // this.reportPath = '~/Resources/docs/sales-order-detail.rdl';
    this.serviceUrl = "https://demos.boldreports.com/services/api/ReportViewer";
    this.reportPath = 'website-visitor-analysis.rdl';
  }
  public barChartOptions: ChartOptions = {
    responsive: true,
    title: {
      display: true,
      text: 'Thống kê nhà cung cấp theo tổng tiền năm 2025',
      fontSize: 16
    },
    legend: {
      position: 'top',
      labels: {
        fontColor: '#333',
        fontSize: 12
      }
    },
    scales: {
      xAxes: [{
        gridLines: {
          color: 'rgba(0, 0, 0, 0.05)',
          zeroLineColor: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          fontColor: '#666'
        }
      }],
      yAxes: [{
        gridLines: {
          color: 'rgba(0, 0, 0, 0.05)',
          zeroLineColor: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          beginAtZero: true,
          fontColor: '#666',
          callback: function(value) {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' đ';
          }
        }
      }]
    },
    tooltips: {
      callbacks: {
        label: function(tooltipItem, data) {
          let value = tooltipItem.yLabel as number;
          return data.datasets[tooltipItem.datasetIndex].label + ': ' + 
                 value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' đ';
        }
      }
    }
  };
  public barChartLabels: Label[] = [];
  public barChartType: ChartType = "bar";
  public barChartLegend = true;
  public barChartData: ChartDataSets[] = [
    { 
      data: [], 
      label: "Tổng tiền nhà cung cấp", 
      backgroundColor: "rgba(54, 181, 216, 0.7)",
      borderColor: "rgba(54, 181, 216, 1)",
      borderWidth: 1,
      hoverBackgroundColor: "rgba(54, 181, 216, 0.9)",
      hoverBorderColor: "rgba(54, 181, 216, 1)"
    },
  ];

  public barChartOptions1: ChartOptions = {
    responsive: true,
    title: {
      display: true,
      text: 'Thống kê nhà cung cấp theo số lượng năm 2025',
      fontSize: 16
    },
    legend: {
      position: 'top',
      labels: {
        fontColor: '#333',
        fontSize: 12
      }
    },
    scales: {
      xAxes: [{
        gridLines: {
          color: 'rgba(0, 0, 0, 0.05)',
          zeroLineColor: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          fontColor: '#666'
        }
      }],
      yAxes: [{
        gridLines: {
          color: 'rgba(0, 0, 0, 0.05)',
          zeroLineColor: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          beginAtZero: true,
          fontColor: '#666'
        }
      }]
    }
  };
  public barChartLabels1: Label[] = [];
  public barChartType1: ChartType = "bar";
  public barChartLegend1 = true;
  public barChartData1: ChartDataSets[] = [
    { 
      data: [], 
      label: "Số lượng", 
      backgroundColor: "rgba(240, 220, 70, 0.7)", 
      borderColor: "rgba(240, 220, 70, 1)",
      borderWidth: 1,
      hoverBackgroundColor: "rgba(240, 220, 70, 0.9)",
      hoverBorderColor: "rgba(240, 220, 70, 1)"
    },
  ];
  ngOnInit(): void {
    this.getSoLuongTon();
    this.NhaCungCapTongTien();
    this.NhaCungCapSoLuong();
    const connection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Information)
      .withUrl("https://localhost:5001/notify")
      .build();
    connection
      .start()
      .then(function () {
        console.log("SignalR Connected!");
      })
      .catch(function (err) {
        return console.error(err.toString());
      });
    connection.on("BroadcastMessage", () => {
      this.getSoLuongTon();
    });
    connection.on("BroadcastMessage", () => {
      this.NhaCungCapTongTien();
    });
    connection.on("BroadcastMessage", () => {
      this.NhaCungCapSoLuong();
    });
  }
  public chartClicked({
    event,
    active,
  }: {
    event: MouseEvent;
    active: {}[];
  }): void {
    console.log(event, active);
  }
  public chartHovered({
    event,
    active,
  }: {
    event: MouseEvent;
    active: {}[];
  }): void {
    console.log(event, active);
  }
  public randomize(): void {
    this.barChartType = this.barChartType === "bar" ? "line" : "bar";
  }
  getSoLuongTon() {
    this.service.getSoLuongTonService().subscribe(
      (result) => {
        this.soLuongTon = result as any;
      },
      (error) => {
        this.errorMessage = <any>error;
      }
    );
  }
  ncctongtien: any;
  lenght1: any;
  NhaCungCapTongTien() {
    this.service.getNhaCungCapTongTienService().subscribe(
      (result) => {
        this.ncctongtien = result as any;
        this.lenght1 = this.ncctongtien.length;
        console.log("do dai", this.lenght1);
        this.barChartLabels = new Array(this.lenght1);
        this.barChartData[0].data = new Array(this.lenght1);
        for (var i = 0; i < this.lenght1; i++) {
          this.barChartLabels[i] = this.ncctongtien[i].ten;
          this.barChartData[0].data[i] = this.ncctongtien[i].tongTien;
        }
      },
      (error) => {
        this.errorMessage = <any>error;
      }
    );
  }
  nccsoluong: any;
  lenght2: any;
  NhaCungCapSoLuong() {
    this.service.getNhaCungCapSoLuongService().subscribe(
      (result) => {
        this.nccsoluong = result as any;
        this.lenght2 = this.nccsoluong.length;
        console.log("do dai", this.lenght2);
        this.barChartLabels1 = new Array(this.lenght2);
        this.barChartData1[0].data = new Array(this.lenght2);
        for (var i = 0; i < this.lenght2; i++) {
          this.barChartLabels1[i] = this.nccsoluong[i].ten;
          this.barChartData1[0].data[i] = this.nccsoluong[i].soLuong;
        }
      },
      (error) => {
        this.errorMessage = <any>error;
      }
    );
  }
}
