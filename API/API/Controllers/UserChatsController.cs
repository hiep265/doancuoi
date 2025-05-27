using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Dtos;
using API.Models;
using API.Helper.SignalR;
using System.Net.Http;
using System.Text;
using System.Text.Json;
namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserChatsController : ControllerBase
    {
        private readonly DPContext _context;
        private readonly IHubContext<BroadcastHub, IHubClient> _hubContext;
        private readonly HttpClient _httpClient;
        public UserChatsController(DPContext context, IHubContext<BroadcastHub, IHubClient> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
            _httpClient = new HttpClient();
        }
        [HttpGet("getchat")]
        public async Task<ActionResult<IEnumerable<ChatUserName>>> GetChat()
        {
            var query = from c in _context.UserChats
                        join u in _context.AppUsers
                        on c.IdUser equals u.Id
                        select new ChatUserName()
                        {
                            IdUser = c.IdUser,
                            ContentChat = c.ContentChat,
                            TimeChat = c.TimeChat,
                            Name = u.FirstName+" "+u.LastName,
                        };
            return await query.ToListAsync();
        }
        [HttpPost("addchat")]
        public async Task<ActionResult> AddChat([FromForm]UploadChat chat)
        {
            var newchat = new UserChat()
            {
                IdUser = chat.IdUser,
                ContentChat=chat.Content,
                TimeChat= DateTime.Now,
            };
           _context.UserChats.Add(newchat);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch(Exception ex)
            {
                Console.Write(ex);
            }
            await _hubContext.Clients.All.BroadcastMessage();
            
            // Nếu tin nhắn từ người dùng (không phải bot), gửi đến webhook
            if (chat.IdUser != "0") // Assume "0" is the bot ID
            {
                try
                {
                    // Gửi tin nhắn đến webhook
                    var webhookUrl = "http://localhost:5678/webhook/519a7e6d-1592-4f97-ba9a-0e0c69159fdd";
                    var content = new StringContent(
                        JsonSerializer.Serialize(new { message = chat.Content }),
                        Encoding.UTF8,
                        "application/json");
                    
                    var response = await _httpClient.PostAsync(webhookUrl, content);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var responseContent = await response.Content.ReadAsStringAsync();
                        var responseData = JsonSerializer.Deserialize<WebhookResponse>(responseContent);
                        
                        // Xác định nội dung phản hồi (hỗ trợ cả định dạng cũ và mới)
                        string botReplyContent = responseData.output ?? responseData.message;
                        
                        if (!string.IsNullOrEmpty(botReplyContent))
                        {
                            // Lưu phản hồi từ webhook
                            var botChat = new UserChat()
                            {
                                IdUser = "0", // "0" là ID của bot
                                ContentChat = botReplyContent,
                                TimeChat = DateTime.Now
                            };
                            
                            _context.UserChats.Add(botChat);
                            await _context.SaveChangesAsync();
                            await _hubContext.Clients.All.BroadcastMessage();
                        }
                    }
                }
                catch (Exception ex)
                {
                    // Log lỗi nhưng không báo lỗi cho client
                    Console.WriteLine($"Webhook error: {ex.Message}");
                }
            }
            
            return Ok();
        }
    }
    
    public class WebhookResponse
    {
        public string message { get; set; }
        public string output { get; set; }
    }
}
