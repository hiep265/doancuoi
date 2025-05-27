using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Dtos;
using API.Models;
using API.Helper.SignalR;
namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ThongKeSoLuongsController : ControllerBase //thong ke theo mot Object hoac 1 so
    {
        private readonly IHubContext<BroadcastHub, IHubClient> _hubContext;
        private readonly DPContext _context;
        private readonly IDataConnector _connector;
        public ThongKeSoLuongsController(DPContext context, IHubContext<BroadcastHub, IHubClient> hubContext, IDataConnector connector)
        {
            this._context = context;
            this._hubContext = hubContext;
            this._connector = connector;
        }
        //Số lượng sản phẩm
        [Route("countproduct")]
        [HttpGet]
        public async Task<ActionResult<int>> GetProductCount()
        {
            int count = await (from not in _context.SanPhams
                               select not).CountAsync();      
            return count;
        }
        //Số lượng đơn hàng
        [Route("countorder")]
        [HttpGet]
        public async Task<ActionResult<int>> GetOrderCount()
        {
            int count = await (from not in _context.HoaDons.Where(s=>s.TrangThai==2)
                               select not).CountAsync();
            return count;
        }
        //Số lượng user
        [Route("countuser")]
        [HttpGet]
        public async Task<ActionResult<int>> GetUserCount()
        {
            int count = await (from not in _context.AppUsers
                               select not).CountAsync();      
            return count;
        }
        //Số lượng tiền thu về
        [Route("countmoney")]
        [HttpGet]
        public async Task<ActionResult<decimal>> GetMoneyCount()
        {
            var count = await (from not in _context.HoaDons
                               select not).ToListAsync();
            decimal TongTienTatCa = 0;
            foreach(HoaDon hd in count)
            {
                TongTienTatCa = TongTienTatCa + hd.TongTien;
            }
            return TongTienTatCa;
        }
        //Khách hàng mua nhiều nhất
        [HttpGet("getkhachhangmuanhieunhat")]
        public async Task<ActionResult<KhachHangMuaNhieuNhat>> GetKhachHangMuaNhieuNhat()
        {
            var khachHang = from h in _context.HoaDons.Where(x => x.TongTien == _context.HoaDons.Select(x => x.TongTien).Max())
                        join u in _context.Users
                        on h.Id_User equals u.Id
                        select new KhachHangMuaNhieuNhat()
                        {
                            Id_User = u.Id,
                            TongTienDaChiTieu = h.TongTien,
                        };
            return await khachHang.FirstOrDefaultAsync() ;
        }
        //Sản phẩm bán chạy nhất
        [HttpGet("getsanphambanchay")]
        public async Task<ActionResult<TenSanPham>> GetSanPhamBanChayNhatAsync()
        {
            var query = from s in _context.SanPhams
                        join c in _context.ChiTietHoaDons
                        on s.Id equals c.Id_SanPham
                        join b in _context.SanPhamBienThes
                        on s.Id equals b.Id_SanPham
                        join h in _context.HoaDons
                        on c.Id_HoaDon equals h.Id
                        select new TenSanPham()
                        {
                            TenSP = $"{s.Ten} {_context.Sizes.Find(b.Id).TenSize} {_context.MauSacs.Find(b.Id).MaMau}",
                            SoSanPhamBanDuoc = c.Soluong,
                        };
            var tenSP = await query.GroupBy(x => x.TenSP).Select(x => x.FirstOrDefault()).FirstOrDefaultAsync();
            return tenSP;
        }
        //Hien tai nam 2021 da ban duoc so don vi tien te la
        [HttpGet("nam2021")]
        public async Task<ActionResult<Nam2021SoTongTien>> GetNam2021TongTien()
        {
            return await _connector.GetNamTongTien(2021);
        }
        
        // Endpoint mới cho phép chọn năm thống kê
        [HttpGet("doanhthunam/{year}")]
        public async Task<ActionResult<Nam2021SoTongTien>> GetDoanhThuTheoNam(int year)
        {
            return await _connector.GetNamTongTien(year);
        }
        
        // Endpoint mới lấy doanh thu năm hiện tại
        [HttpGet("doanhthuhientai")]
        public async Task<ActionResult<Nam2021SoTongTien>> GetDoanhThuHienTai()
        {
            return await _connector.GetNamTongTien(DateTime.Now.Year);
        }
        
        [HttpGet("soluongton")]
        public async Task<ActionResult<int>> GetSoLuongTonTrongKho()
        {
            var query = from s in _context.SanPhamBienThes
                        select new SanPhamBienThe
                        {
                          SoLuongTon = s.SoLuongTon,
                        };
            var slt = await query.FirstOrDefaultAsync();
            return slt.SoLuongTon;
        }
       //Tong so luong ban ra trong nam
       [HttpGet("Soluongsanphambanratrongnam")]
        public async Task<ActionResult<SoLuongBanRaTrongNam>> GetSoLuongBanRaTrongNam()
        {
            try
            {
                int currentYear = DateTime.Now.Year;
                var query = from h in _context.HoaDons.Where(x => x.NgayTao.Year == currentYear)
                            join c in _context.ChiTietHoaDons
                            on h.Id equals c.Id_HoaDon
                            select new SoLuongBanRaTrongNam()
                            {
                                Nam = h.NgayTao.Year,
                                SoLuong = c.Soluong,
                            };
                var list = await query
                    .ToListAsync();
                var result = list.GroupBy(x => x.Nam)
                    .Select(x => x.FirstOrDefault())
                    .FirstOrDefault();
                    
                // Nếu không có dữ liệu, trả về giá trị mặc định cho năm hiện tại
                if (result == null)
                {
                    result = new SoLuongBanRaTrongNam
                    {
                        Nam = currentYear,
                        SoLuong = 0
                    };
                }
                return result;
            }
            catch
            {
                return BadRequest("Đã xảy ra lỗi khi lấy dữ liệu");
            }
        }
        
        // Thêm endpoint mới cho phép chọn năm
        [HttpGet("Soluongsanphambanratrongnam/{year}")]
        public async Task<ActionResult<SoLuongBanRaTrongNam>> GetSoLuongBanRaTrongNamTheoNam(int year)
        {
            try
            {
                var query = from h in _context.HoaDons.Where(x => x.NgayTao.Year == year)
                            join c in _context.ChiTietHoaDons
                            on h.Id equals c.Id_HoaDon
                            select new SoLuongBanRaTrongNam()
                            {
                                Nam = h.NgayTao.Year,
                                SoLuong = c.Soluong,
                            };
                var list = await query
                    .ToListAsync();
                var result = list.GroupBy(x => x.Nam)
                    .Select(x => x.FirstOrDefault())
                    .FirstOrDefault();
                    
                // Nếu không có dữ liệu, trả về giá trị mặc định
                if (result == null)
                {
                    result = new SoLuongBanRaTrongNam
                    {
                        Nam = year,
                        SoLuong = 0
                    };
                }
                return result;
            }
            catch
            {
                return BadRequest("Đã xảy ra lỗi khi lấy dữ liệu");
            }
        }
    }
}
