using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using API.Data;
using API.Dtos;
using API.Models;
using API.Helper.SignalR;
namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoaisController : ControllerBase
    {
        private readonly DPContext _context;
        private readonly IHubContext<BroadcastHub, IHubClient> _hubContext;
        public LoaisController(DPContext context, IHubContext<BroadcastHub, IHubClient> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }
        // GET: api/Loais - Lấy tất cả danh mục sản phẩm
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Loai>>> GetLoais()
        {
            return await _context.Loais.ToListAsync();
        }
        // GET: api/Loais/5 - Lấy danh mục theo ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Loai>> GetLoai(int id)
        {
            var category = await _context.Loais.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }
            return category;
        }
        // GET: api/Loais/{id}/products - Lấy sản phẩm theo danh mục
        [HttpGet("{id}/products")]
        public async Task<ActionResult<IEnumerable<SanPhamLoai>>> GetLoaiProducts(int id)
        {
            var categoryExists = await _context.Loais.AnyAsync(l => l.Id == id);
            if (!categoryExists)
            {
                return NotFound();
            }
            var products = from loai in _context.Loais.Where(l => l.Id == id)
                         join sanpham in _context.SanPhams
                         on loai.Id equals sanpham.Id_Loai
                         select new SanPhamLoai()
                         {
                             SoLuongSanPham = _context.SanPhams.Count(s => s.Id_Loai == id),
                             Id = sanpham.Id,
                             Ten = sanpham.Ten,
                             KhuyenMai = sanpham.KhuyenMai,
                             MoTa = sanpham.MoTa,
                             TrangThaiHoatDong = sanpham.TrangThaiHoatDong,
                             TrangThaiSanPham = "sanpham thuong",
                             HuongDan = sanpham.HuongDan,
                             ThanhPhan = sanpham.ThanhPhan,
                             TenLoai = loai.Ten,
                         };
            return await products.ToListAsync();
        }
        // POST: api/Loais - Thêm danh mục mới
        [HttpPost]
        public async Task<ActionResult<Loai>> PostLoai([FromForm] UploadCategory upload)
        {
            Notification notification = new Notification()
            {
                TenSanPham = upload.Name,
                TranType = "Add"
            };
            _context.Notifications.Add(notification);
            Loai loai = new Loai();
            loai.Ten = upload.Name;
            _context.Loais.Add(loai);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.BroadcastMessage();
            return CreatedAtAction("GetLoai", new { id = loai.Id }, loai);
        }
        // PUT: api/Loais/5 - Cập nhật danh mục
        [HttpPut("{id}")]
        public async Task<IActionResult> PutLoai(int id, [FromForm] UploadCategory upload)
        {
            var loai = await _context.Loais.FindAsync(id);
            if (loai == null)
            {
                return NotFound();
            }
            Notification notification = new Notification()
            {
                TenSanPham = upload.Name,
                TranType = "Edit"
            };
            _context.Notifications.Add(notification);
            loai.Ten = upload.Name;
            _context.Loais.Update(loai);
            try
            {
                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.BroadcastMessage();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LoaiExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return NoContent();
        }
        // DELETE: api/Loais/5 - Xóa danh mục
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLoai(int id)
        {
            var category = await _context.Loais.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }
            // Lấy các sản phẩm liên quan đến danh mục
            var products = await _context.SanPhams.Where(s => s.Id_Loai == id).ToArrayAsync();
            var sizes = await _context.Sizes.Where(s => s.Id_Loai == id).ToArrayAsync();
            var colors = await _context.MauSacs.Where(s => s.Id_Loai == id).ToArrayAsync();
            Notification notification = new Notification()
            {
                TenSanPham = category.Ten,
                TranType = "Delete"
            };
            _context.Notifications.Add(notification);
            // Xóa các dữ liệu liên quan trước khi xóa danh mục
            if (products.Length > 0 || sizes.Length > 0 || colors.Length > 0)
            {
                if (sizes.Length > 0)
                    _context.Sizes.RemoveRange(sizes);
                if (products.Length > 0)
                    _context.SanPhams.RemoveRange(products);
                if (colors.Length > 0)
                    _context.MauSacs.RemoveRange(colors);
                await _context.SaveChangesAsync();
            }
            // Xóa danh mục
            _context.Loais.Remove(category);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.BroadcastMessage();
            return NoContent();
        }
        private bool LoaiExists(int id)
        {
            return _context.Loais.Any(e => e.Id == id);
        }
    }
}
