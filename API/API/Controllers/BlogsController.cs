using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Dtos;
using API.Models;
using API.Helper.SignalR;
using API.Helper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860
namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogsController : Controller
    {
        private readonly IHubContext<BroadcastHub, IHubClient> _hubContext;
        private readonly DPContext _context;
        public BlogsController(DPContext context, IHubContext<BroadcastHub, IHubClient> hubContext)
        {
            this._context = context;
            this._hubContext = hubContext;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BlogAndImage>>> GetllBlogs()
        {
            var blogs = _context.Blogs.Select(b => new BlogAndImage()
            {
                Id = b.Id,
                TieuDe = b.TieuDe,
                NoiDung = b.NoiDung,
                image = _context.ImageBlogs.Where(s => s.FkBlogId == b.Id).Select(s => s.ImageName).FirstOrDefault(),
                nameUser = _context.AppUsers.Where(s => s.Id == b.FkAppUser_NguoiThem).Select(s => s.FirstName + " " + s.LastName).FirstOrDefault(),
            });
            return await blogs.ToListAsync();
        }
        [HttpPost("getBlog")]
        public async Task<ActionResult> GetBlog()
        {
            var resuft = await _context.Blogs.Select(d=>
            new { 
                id=d.Id,
                tieude=d.TieuDe,
                noidung =d.NoiDung,
                image = _context.ImageBlogs.Where(s=>s.FkBlogId==d.Id).Select(d=>d.ImageName).SingleOrDefault(),
            }).ToListAsync();
            return Json(resuft);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBlog(int id, [FromForm] UploadBlog upload)
        {
            var listImage = new List<ImageBlog>();
            Blog blog = new Blog();
            blog = await _context.Blogs.FindAsync(id);
            
            if (blog == null)
                return NotFound();
                
            blog.TieuDe = upload.TieuDe;
            blog.NoiDung = upload.NoiDung;
            blog.FkAppUser_NguoiThem = upload.FkUserId;
            Notification notification = new Notification()
            {
                TenSanPham = upload.TieuDe,
                TranType = "Edit"
            };
            _context.Notifications.Add(notification);
            ImageBlog[] images = _context.ImageBlogs.Where(s => s.FkBlogId == id).ToArray();
            _context.ImageBlogs.RemoveRange(images);
            ImageBlog image = new ImageBlog();
            
            // Fix lỗi null parameter for ToArray()
            IFormFile[] files = upload.files != null ? upload.files.ToArray() : new IFormFile[0];
            
            var imageBlogs = _context.ImageBlogs.ToArray().Where(s => s.FkBlogId == id);
            foreach (var i in imageBlogs)
            {
                FileHelper.DeleteFileOnTypeAndNameAsync("blog", i.ImageName);
            }
            if (upload.files != null)
            {
                for (int i = 0; i < files.Length; i++)
                {
                    if (files[i].Length > 0 && files[i].Length < 5120)
                    {
                        listImage.Add(new ImageBlog()
                        {
                            ImageName =await FileHelper.UploadImageAndReturnFileNameAsync(null,upload,"blog", (IFormFile[])upload.files,i),
                            FkBlogId = blog.Id,
                        });
                    }
                }
            }
            else // xu li khi khong cap nhat hinh
            {
                List<ImageBlog> List;
                List = _context.ImageBlogs.Where(s => s.FkBlogId == id).ToList();
                foreach (ImageBlog img in List)
                    listImage.Add(new ImageBlog()
                    {
                        ImageName = img.ImageName,
                        FkBlogId = blog.Id,
                    }); ;
            };
            blog.ImageBlogs = listImage;
            _context.Blogs.Update(blog);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.BroadcastMessage();
            return Ok();
        }
        // POST: api/Blogs
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Blog>> PostBlog([FromForm] UploadBlog upload)
        {
            try
            {
                Blog blog = new Blog();
                blog.TieuDe = upload.TieuDe;
                blog.NoiDung = upload.NoiDung;
                
                // Xử lý FkUserId theo phương pháp tương tự UpdateBlog
                if (!string.IsNullOrEmpty(upload.FkUserId))
                {
                    // Thử tìm user bằng cách chuyển FkUserId thành số và dùng làm vị trí trong danh sách
                    if (int.TryParse(upload.FkUserId, out int userIndex) && userIndex > 0)
                    {
                        var users = await _context.AppUsers.ToListAsync();
                        var allUsers = users.ToList();
                        
                        // Trừ đi 1 vì index là 0-based nhưng userIndex có thể là 1-based
                        userIndex = userIndex - 1;
                        
                        if (userIndex >= 0 && userIndex < allUsers.Count)
                        {
                            var targetUser = allUsers[userIndex];
                            blog.FkAppUser_NguoiThem = targetUser.Id;
                        }
                        else
                        {
                            return BadRequest(new { 
                                message = "Index user không hợp lệ", 
                                requestedIndex = userIndex + 1,
                                totalUsers = allUsers.Count,
                                availableUserIds = allUsers.Select(u => new { Index = allUsers.IndexOf(u) + 1, Id = u.Id, Name = u.UserName }).Take(5)
                            });
                        }
                    }
                    else
                    {
                        // Vẫn giữ cách kiểm tra cũ nếu không phải số
                        var users = await _context.AppUsers.ToListAsync();
                        var userExists = users.Any(u => u.Id == upload.FkUserId);
                        
                        if (!userExists)
                        {
                            return BadRequest(new { 
                                message = "User không tồn tại", 
                                requestedId = upload.FkUserId,
                                suggestion = "Hãy gửi số nguyên từ 1-N thay vì ID",
                                availableUserIds = users.Select((u, index) => new { Index = index + 1, Id = u.Id, Name = u.UserName }).Take(5)
                            });
                        }
                        
                        blog.FkAppUser_NguoiThem = upload.FkUserId;
                    }
                }
                
                Notification notification = new Notification()
                {
                    TenSanPham = upload.TieuDe,
                    TranType = "Add"
                };
                _context.Notifications.Add(notification);
                
                // Thêm blog trước khi xử lý hình ảnh
                _context.Blogs.Add(blog);
                await _context.SaveChangesAsync();
                
                // Xử lý upload hình ảnh nếu có
                if (upload.files != null && upload.files.Count() > 0)
                {
                    foreach (var file in upload.files)
                    {
                        if (file.Length > 0 && file.Length < 5120000) // 5MB
                        {
                            ImageBlog imageBlog = new ImageBlog();
                            _context.ImageBlogs.Add(imageBlog);
                            await _context.SaveChangesAsync();
                            
                            imageBlog.ImageName = await FileHelper.UploadImageAndReturnFileNameAsync(
                                null, upload, "blog", upload.files.ToArray(), 
                                Array.IndexOf(upload.files.ToArray(), file));
                            
                            imageBlog.FkBlogId = blog.Id;
                            _context.ImageBlogs.Update(imageBlog);
                            await _context.SaveChangesAsync();
                        }
                    }
                }
                
                await _hubContext.Clients.All.BroadcastMessage();
                return Ok(new { message = "Tạo blog thành công", blogId = blog.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    message = "Lỗi khi tạo blog", 
                    error = ex.Message,
                    innerError = ex.InnerException?.Message 
                });
            }
        }
        // DELETE: api/Blogs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBlog(int id)
        {
            var imageBlogs = _context.ImageBlogs.ToArray().Where(s => s.FkBlogId == id);
            foreach (var i in imageBlogs)
            {
                FileHelper.DeleteFileOnTypeAndNameAsync("blog", i.ImageName);
            }
            _context.ImageBlogs.RemoveRange(imageBlogs);
            var blog = await _context.Blogs.FindAsync(id);
            _context.Blogs.Remove(blog);
            await _context.SaveChangesAsync();
            return Ok();
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<BlogAndImage>> GetBlogById(int id)
        {
            var blog = await _context.Blogs
                .Where(b => b.Id == id)
                .Select(b => new BlogAndImage()
                {
                    Id = b.Id,
                    TieuDe = b.TieuDe,
                    NoiDung = b.NoiDung,
                    image = _context.ImageBlogs.Where(s => s.FkBlogId == b.Id).Select(s => s.ImageName).FirstOrDefault(),
                    nameUser = _context.AppUsers.Where(s => s.Id == b.FkAppUser_NguoiThem).Select(s => s.FirstName + " " + s.LastName).FirstOrDefault(),
                })
                .FirstOrDefaultAsync();

            if (blog == null)
                return NotFound();

            return Ok(blog);
        }
        [HttpPost("update/{id}")]
        public async Task<IActionResult> UpdateBlog(int id, [FromForm] UploadBlog upload)
        {
            try
            {
                // Tìm blog cần update
                var blog = await _context.Blogs.FindAsync(id);
                if (blog == null)
                    return NotFound();
                
                // Cập nhật thông tin cơ bản
                blog.TieuDe = upload.TieuDe;
                blog.NoiDung = upload.NoiDung;
                
                // Kiểm tra FkUserId có tồn tại
                if (!string.IsNullOrEmpty(upload.FkUserId))
                {
                    // Thử tìm user bằng cách chuyển FkUserId thành số và dùng làm vị trí trong danh sách
                    if (int.TryParse(upload.FkUserId, out int userIndex) && userIndex > 0)
                    {
                        var users = await _context.AppUsers.ToListAsync();
                        var allUsers = users.ToList();
                        
                        // Trừ đi 1 vì index là 0-based nhưng userIndex có thể là 1-based
                        userIndex = userIndex - 1;
                        
                        if (userIndex >= 0 && userIndex < allUsers.Count)
                        {
                            var targetUser = allUsers[userIndex];
                            blog.FkAppUser_NguoiThem = targetUser.Id;
                        }
                        else
                        {
                            return BadRequest(new { 
                                message = "Index user không hợp lệ", 
                                requestedIndex = userIndex + 1,
                                totalUsers = allUsers.Count,
                                availableUserIds = allUsers.Select(u => new { Index = allUsers.IndexOf(u) + 1, Id = u.Id, Name = u.UserName }).Take(5)
                            });
                        }
                    }
                    else
                    {
                        // Vẫn giữ cách kiểm tra cũ nếu không phải số
                        var users = await _context.AppUsers.ToListAsync();
                        var userExists = users.Any(u => u.Id == upload.FkUserId);
                        
                        if (!userExists)
                        {
                            return BadRequest(new { 
                                message = "User không tồn tại", 
                                requestedId = upload.FkUserId,
                                suggestion = "Hãy gửi số nguyên từ 1-N thay vì ID",
                                availableUserIds = users.Select((u, index) => new { Index = index + 1, Id = u.Id, Name = u.UserName }).Take(5)
                            });
                        }
                        
                        blog.FkAppUser_NguoiThem = upload.FkUserId;
                    }
                }
                
                // Tạo notification
                Notification notification = new Notification()
                {
                    TenSanPham = upload.TieuDe,
                    TranType = "Edit"
                };
                _context.Notifications.Add(notification);
                
                // Xử lý hình ảnh
                // 1. Lấy danh sách ảnh hiện tại
                var currentImages = await _context.ImageBlogs.Where(s => s.FkBlogId == id).ToListAsync();
                
                // 2. Xóa các file ảnh hiện tại (nếu có upload ảnh mới)
                if (upload.files != null && upload.files.Count() > 0)
                {
                    foreach (var img in currentImages)
                    {
                        FileHelper.DeleteFileOnTypeAndNameAsync("blog", img.ImageName);
                    }
                    
                    // 3. Xóa các bản ghi ảnh cũ trong DB
                    _context.ImageBlogs.RemoveRange(currentImages);
                    await _context.SaveChangesAsync(); // Lưu thay đổi trước để tránh xung đột
                    
                    // 4. Thêm ảnh mới
                    var listImage = new List<ImageBlog>();
                    foreach (var file in upload.files)
                    {
                        if (file.Length > 0 && file.Length < 5120000) // 5MB
                        {
                            var imageName = await FileHelper.UploadImageAndReturnFileNameAsync(null, upload, "blog", upload.files.ToArray(), Array.IndexOf(upload.files.ToArray(), file));
                            
                            var imageBlog = new ImageBlog
                            {
                                ImageName = imageName,
                                FkBlogId = blog.Id
                            };
                            
                            listImage.Add(imageBlog);
                        }
                    }
                    
                    // 5. Thêm ảnh vào DB
                    await _context.ImageBlogs.AddRangeAsync(listImage);
                }
                
                // Cập nhật blog
                _context.Blogs.Update(blog);
                
                // Lưu thay đổi
                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.BroadcastMessage();
                
                return Ok(new { message = "Cập nhật blog thành công", blogId = blog.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    message = "Lỗi khi cập nhật blog", 
                    error = ex.Message,
                    innerError = ex.InnerException?.Message 
                });
            }
        }
    }
}
