using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Classes;
using System.Text.Json;

namespace Admin.Controllers
{
  public class CitiesController : BaseController<ICitiesService, City>
  {
    public CitiesController(IServiceProvider serviceProvider, IMediator mediator) : base(serviceProvider, mediator)
    {

    }

    //[Authorize]
    //[HttpGet()]
    //public async Task<List<Cities>> Get()
    //{
    //  Response.Headers["Cache-Control"] = "public, max-age=60";
    //  return await Repository.GetList();
    //}

    //[HttpGet("stream")]
    //public async Task StreamData()
    //{
    //  Response.ContentType = "application/json";
    //  Response.StatusCode = 200;
    //  Cities[] array = new Cities[]
    //  {
    //    new Cities { Id = Guid.NewGuid(), Name = "New York", Code = "NY" },
    //    new Cities { Id = Guid.NewGuid(), Name = "Los Angeles", Code = "LA" },
    //    new Cities { Id = Guid.NewGuid(), Name = "Chicago", Code = "CC" },
    //    new Cities { Id = Guid.NewGuid(), Name = "Houston", Code = "HT" },
    //    new Cities { Id = Guid.NewGuid(), Name = "Phoenix", Code = "PN" }
    //  };
    //  for (int i = 0; i < array.Length * 3; i++)
    //  {
    //    var user = array[i % 5];
    //    // Chuyển đối tượng User thành chuỗi JSON
    //    var jsonData = JsonSerializer.Serialize(user);
    //    await Response.WriteAsync(jsonData);
    //    await Response.WriteAsync("\n"); // Thêm dòng mới để phân biệt các đối tượng JSON
    //    await Response.Body.FlushAsync(); // Đảm bảo dữ liệu được gửi đi ngay lập tức
    //    await Task.Delay(1000); // Giả lập độ trễ giữa các chunk dữ liệu
    //  }
    //}

    //[HttpGet("stream2")]
    //public async Task StreamData2()
    //{
    //  Response.ContentType = "text/event-stream";  // Đảm bảo kiểu dữ liệu là SSE
    //  Response.Headers.Add("Cache-Control", "no-cache");
    //  Response.Headers.Add("Connection", "keep-alive");

    //  Cities[] array = new Cities[]
    //  {
    //    new Cities { Id = Guid.NewGuid(), Name = "New York", Code = "NY" },
    //    new Cities { Id = Guid.NewGuid(), Name = "Los Angeles", Code = "LA" },
    //    new Cities { Id = Guid.NewGuid(), Name = "Chicago", Code = "CC" },
    //    new Cities { Id = Guid.NewGuid(), Name = "Houston", Code = "HT" },
    //    new Cities { Id = Guid.NewGuid(), Name = "Phoenix", Code = "PN" }
    //  };

    //  for (int i = 0; i < array.Length * 3; i++)
    //  {
    //    var user = array[i % 5];
    //    // Tạo chunk JSON cho từng User và gửi cho client
    //    var userJson = JsonSerializer.Serialize(user);
    //    await Response.WriteAsync($"data: {userJson}\n\n");
    //    await Response.Body.FlushAsync();  // Đảm bảo gửi ngay lập tức
    //    await Task.Delay(1000);  // Giả lập một delay trước khi gửi tiếp phần tiếp theo
    //  }
    //}
  }
}
