using API.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
namespace API.Helper
{
    public static class FileHelper
    {
        private static string GetContentType(string path)
        {
            var provider = new FileExtensionContentTypeProvider();
            string contentType;
            if (!provider.TryGetContentType(path, out contentType))
            {
                contentType = "application/octet-stream";
            }
            return contentType;
        }
        //input : id
        //output : path (folder name/id)
        public static async Task<string> UploadImageAndReturnPathAsync(int id, string type, IFormFile file)
        {
            //define directory path
            string dirPath = "wwwroot/images/" + type;
            bool exist = Directory.Exists(dirPath);
            if (!exist)
            {
                Directory.CreateDirectory(dirPath);
            }
            if (file.Length > 0 && file.Length < 5120)
            {
                //get file extension
                var fileExtension = "." + file.FileName.Split(".")[file.FileName.Split(".").Length - 1];
                var path = Path.Combine(Directory.GetCurrentDirectory(), dirPath, id.ToString() + fileExtension);
                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                };
                return path;
            }
            return null;
        }
        public static bool DeleteFileOnTypeAndNameAsync(string type , string name)
        {
            try
            {
                if (type == "product")
                {
                   File.Delete(Path.Combine("wwwroot/Images/list-image-product", name));
                    return true;
                }
                else
                {
                    File.Delete(Path.Combine("wwwroot/Images/list-image-blog", name));
                    return true;
                }
            }
            catch (Exception)
            {
                return false;
            }
        }
        public static async Task<string> UploadImageAndReturnFileNameAsync(UploadSanpham sanpham, UploadBlog blog, string type, IFormFile[] files, int index)
        {
            try
            {
                if (files == null || index < 0 || index >= files.Length || files[index] == null)
                {
                    throw new ArgumentException("Invalid file or index");
                }

                IFormFile file = files[index];
                string fileName = file.FileName;
                string fileExtension = Path.GetExtension(fileName);
                
                if (string.IsNullOrEmpty(fileExtension))
                {
                    fileExtension = ".jpg"; // Default extension if none is found
                }
                else if (fileExtension.StartsWith("."))
                {
                    // Keep it as is
                }
                else
                {
                    fileExtension = "." + fileExtension;
                }

                string targetFileName;
                string directoryPath;

                if (type == "product")
                {
                    if (sanpham == null || string.IsNullOrEmpty(sanpham.Ten))
                    {
                        targetFileName = "product_" + Guid.NewGuid().ToString().Substring(0, 8) + index + fileExtension;
                    }
                    else
                    {
                        // Sanitize filename to prevent path traversal or invalid chars
                        string safeName = string.Join("_", sanpham.Ten.Split(Path.GetInvalidFileNameChars()));
                        targetFileName = safeName + index + fileExtension;
                    }
                    
                    directoryPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Images", "list-image-product");
                }
                else
                {
                    if (blog == null || string.IsNullOrEmpty(blog.TieuDe))
                    {
                        targetFileName = "blog_" + Guid.NewGuid().ToString().Substring(0, 8) + index + fileExtension;
                    }
                    else
                    {
                        // Sanitize filename to prevent path traversal or invalid chars
                        string safeName = string.Join("_", blog.TieuDe.Split(Path.GetInvalidFileNameChars()));
                        targetFileName = safeName + index + fileExtension;
                    }
                    
                    directoryPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Images", "list-image-blog");
                }

                // Ensure directory exists
                if (!Directory.Exists(directoryPath))
                {
                    Directory.CreateDirectory(directoryPath);
                }

                var fullPath = Path.Combine(directoryPath, targetFileName);
                
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                
                return targetFileName;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UploadImageAndReturnFileNameAsync: {ex.Message}");
                throw; // Re-throw to be handled by caller
            }
        }
    }
}
