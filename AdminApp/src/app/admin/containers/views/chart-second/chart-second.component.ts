import { Component, NgZone, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as signalR from '@microsoft/signalr';
import { ChartSecondService } from './chart-second.service';
import { SelectMonthComponent } from './select-month/select-month.component';
@Component({
  selector: 'app-chart-second',
  templateUrl: './chart-second.component.html',
  styleUrls: ['./chart-second.component.scss']
})
export class ChartSecondComponent implements OnInit {
  dataSourceBrand: { 
    chart: { 
      caption: string; 
      plottooltext: string; 
      showLegend: string; 
      showPercentValues: string; 
      legendPosition: string; 
      useDataPlotColorForLabels: string; 
      enablemultislicing: string; 
      showlegend: string; 
      theme: string;
      [key: string]: any; // Thêm index signature để chấp nhận các thuộc tính khác
    }; 
    data: { 
      label: string; 
      value: string; 
    }[]; 
  };
  nam2021: any;
  errorMessage: any;
  dataThongKe: any;
  soLanXuatHien: any;
  doanhthucaonhat: any;
  nam2021soluong: any;
  soLuongTon: any;
  constructor(public service:ChartSecondService,    public dialog: MatDialog,
    public zone: NgZone) {
    this.dataSourceBrand = {
      "chart": {
        "caption": "Tỉ lệ giữa top(3) các nhãn hiệu bán chạy nhất trong năm 2025",
        "plottooltext": "$label đạt tỉ lệ <b>$percentValue</b>",
        "showLegend": "1",
        "showPercentValues": "1",
        "legendPosition": "bottom",
        "useDataPlotColorForLabels": "1",
        "enablemultislicing": "0",
        "showlegend": "0",
        "theme": "fusion",
        "paletteColors": "#36B5D8, #F0DC46, #7F5BD9",
        "decimals": "1",
        "bgColor": "#ffffff",
        "bgAlpha": "100",
        "borderThickness": "0",
        "showBorder": "0",
        "showShadow": "0",
        "chartTopMargin": "20",
        "chartBottomMargin": "20",
        "chartLeftMargin": "20",
        "chartRightMargin": "20"
      },
      "data": [{
        label: "",
        value: ""
      }, {
        label: "",
        value: ""
      }, {
        label: "",
        value: ""
      }]
    };
  }
  public dataSourceYear: any = {
    chart: {
      caption: 'Doanh thu các tháng trong năm 2025',
      xAxisName: 'Tháng',
      yAxisName: 'Số tiền thu về (VNĐ)',
      numberSuffix: ' đ',
      theme: 'fusion',
      paletteColors: "#36B5D8",
      showValues: "1",
      showCanvasBorder: "0",
      bgColor: "#ffffff",
      plotGradientColor: "",
      usePlotGradientColor: "0",
      plotBorderDashLen: "1",
      plotBorderDashGap: "1",
      showPlotBorder: "0",
      divLineColor: "#999999",
      divLineAlpha: "40",
      showAlternateHGridColor: "0",
      captionFontSize: "16",
      subcaptionFontSize: "14",
      showLimits: "1"
    },
    data: [
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" }
    ]
  }
    ;
  public dataSourceSoLanXuatHien: any = {
    chart: {
      caption: 'Top 10 sản phẩm bán chạy nhất theo số lượng năm 2025',
      xAxisName: 'Tên sản phẩm',
      yAxisName: 'Số lượng đã bán',
      numberSuffix: '',
      theme: 'fusion',
      paletteColors: "#F0DC46",
      showValues: "1",
      plotSpacePercent: "60",
      bgColor: "#ffffff",
      showCanvasBorder: "0",
      showBorder: "0",
      showLimits: "1",
      captionFontSize: "16",
      subcaptionFontSize: "14",
      toolTipBgColor: "#ffffff",
      toolTipPadding: "8",
      toolTipBorderRadius: "4",
      toolTipBorderColor: "#d9d9d9",
      toolTipBorderAlpha: "80"
    },
    data: [
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" }
    ]
  }
  public dataSourceDoanhThu: any = {
    chart: {
      caption: 'Top 10 sản phẩm biến thể đạt doanh số cao nhất năm 2025',
      xAxisName: 'Tên sản phẩm biến thể',
      yAxisName: 'Doanh thu (VNĐ)',
      numberSuffix: ' đ',
      theme: 'fusion',
      paletteColors: "#7F5BD9",
      showValues: "1",
      plotSpacePercent: "60",
      bgColor: "#ffffff",
      showCanvasBorder: "0",
      showBorder: "0",
      showLimits: "1",
      captionFontSize: "16",
      subcaptionFontSize: "14",
      plotToolText: "<div><b>$label</b><br/>Doanh thu: <b>$dataValue</b></div>"
    },
    data: [
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
    ]
   }
  ngOnInit(): void {
    this.getTop10SanPhamLoiNhats()
    this.getSoLanXuatHienTrongDonHang()
    this.getThongKeThang();
    this.getNam2021doanhso();
    this.getSoLuongTrongNam();
    this.getTopNhanHieu();
    const connection = new signalR.HubConnectionBuilder()
    .configureLogging(signalR.LogLevel.Information)
    .withUrl('https://localhost:5001/notify')
    .build();
  connection.start().then(function () {
    console.log('SignalR Connected!');
  }).catch(function (err) {
    return console.error(err.toString());
  });
    connection.on("BroadcastMessage", () => {
      this.getSoLanXuatHienTrongDonHang()
    });
    connection.on("BroadcastMessage", () => {
      this.getThongKeThang();
    });
    connection.on("BroadcastMessage", () => {
      this.getTop10SanPhamLoiNhats()
    })
    connection.on("BroadcastMessage", () => {
      this.getTopNhanHieu()
    })
    connection.on("BroadcastMessage", () => {
      this.getNam2021doanhso()
    })
    connection.on("BroadcastMessage", () => {
      this.getNam2021doanhso()
    })
    connection.on("BroadcastMessage", () => {
      this.getSoLuongTrongNam()
    })
  }
  getNam2021doanhso() {
    this.service.getNam2021DoanhSo().subscribe(
      result => {
        this.nam2021 = result as any
      },
      error => {
        this.errorMessage = <any>error
      }
    )
  }
  //quantrong
  getThongKeThang() {
    this.service.getThongKeThang().subscribe(
      (result: any) => {
        this.dataThongKe = result as any
        console.log(this.dataThongKe);
        for (var i = 0; i < this.dataThongKe.length; i++) {
          this.dataSourceYear.data[this.dataThongKe[i].month].label = this.dataThongKe[i].month as any
          this.dataSourceYear.data[this.dataThongKe[i].month].value = this.dataThongKe[i].revenues as any
        }
      },
      error => {
        this.errorMessage = <any>error
      }
    )
  }
  //quantrong
  //Quan trong
  lengthtopsolan: any
  getSoLanXuatHienTrongDonHang() {
    this.service.getSoLanSanPhamXuatHienTrongDonHang().subscribe(
      result => {
        this.soLanXuatHien = result as any
        this.lengthtopsolan = this.soLanXuatHien.length
        for (var i = 0; i < this.lengthtopsolan; i++) {
          this.dataSourceSoLanXuatHien.data[i].label = this.soLanXuatHien[i].tenSP
          this.dataSourceSoLanXuatHien.data[i].value = this.soLanXuatHien[i].soLanXuatHienTrongDonHang
        }
      },
      error => {
        this.errorMessage = <any>error
        console.log(error);
      }
    )
  }
  //quantrong
  ///Quan trong
  lengthtop: any
  getTop10SanPhamLoiNhats() {
    this.service.getSanPhamDoanhThuTop().subscribe(
      result => {
        this.doanhthucaonhat = result as any
        this.lengthtop = this.doanhthucaonhat.length
        for (var i = 0; i < this.lengthtop; i++) {
          this.dataSourceDoanhThu.data[i].label = this.doanhthucaonhat[i].tenSP
          this.dataSourceDoanhThu.data[i].value = this.doanhthucaonhat[i].doanhSoCaoNhat
        }
      }
    )
  }
  ///Quan trong
  getSoLuongTrongNam() {
    this.service.getNam2021SoLuong().subscribe(
      result => {
        this.nam2021soluong = result as any
      },
      error => {
        this.errorMessage = <any>error
      }
    )
  }
  bienthedoanhthu: any
  getTopBienTheDoanhThu() {
    this.service.getTopBienTheDoanhThu().subscribe(
      result => {
        this.bienthedoanhthu = result as any
      },
      error => {
        this.errorMessage = <any>error
      }
    )
  }
  nhanhieutop: any
  getTopNhanHieu() {
    this.service.getTopNhanHieuDoanhThu().subscribe(
      result => {
        this.nhanhieutop = result as any
        for (var i = 0; i < this.nhanhieutop.length; i++) {
          this.dataSourceBrand.data[i].label = this.nhanhieutop[i].ten
          this.dataSourceBrand.data[i].value = this.nhanhieutop[i].soLuong
        }
      },
      error => {
        this.errorMessage = <any>error
      }
    )
  }
  openDialog() {
    const dialogRef = this.dialog.open(SelectMonthComponent);
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
