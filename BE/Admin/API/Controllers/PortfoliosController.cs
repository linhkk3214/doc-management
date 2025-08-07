using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shared.Classes;
using System.Text.Json;

namespace Admin.Controllers
{
  public class PortfoliosController : BaseController<IPortfoliosService, Portfolio>
  {
    private readonly IPortfoliosService _portfoliosService;
        private readonly IConfiguration _configuration;
        private readonly AdminDbContext _dbContext;
    public PortfoliosController(
      IServiceProvider serviceProvider, IMediator mediator, AdminDbContext dbContext,
      IPortfoliosService portfoliosService,
      IConfiguration configuration
    ) : base(serviceProvider, mediator)
    {
      _portfoliosService = portfoliosService;
            this._configuration = configuration;
            _dbContext = dbContext;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> GetData(Guid id, [FromBody] Portfolio model)
    {
      Portfolio item = await _dbContext.Portfolios.Where(q => q.Id == id).FirstOrDefaultAsync();
      if (item == null)
        return NotFound();
      item.Code = model.Code;
      item.Name = model.Name;
      item.DepartmentId = model.DepartmentId;
      item.TermId = model.TermId;
      item.StartDate = model.StartDate;
      item.EndDate = model.EndDate;
      item.RetentionPeriod = model.RetentionPeriod;
      return ResponseResult(
        await _portfoliosService.Update(item)
      );
    }

    [HttpGet("{id}/file")]
    public async Task<IActionResult> ViewFile(Guid id)
    {
      try
      {
        // Get document from database
        var document = await _portfoliosService.GetById(id, default);

        if (document == null || !document.Success || document.Data == null)
        {
          return NotFound(new { message = "Không tìm thấy tài liệu" });
        }

        var doc = document.Data;

        // Check if file path exists
        if (string.IsNullOrEmpty(doc.OriginalPath))
        {
          return NotFound(new { message = "Tài liệu chưa có file đính kèm" });
        }

        // Get full file path
        var filePath = doc.OriginalPath;

        // Check if path is relative, make it absolute
        if (!Path.IsPathRooted(filePath))
        {
          // You may need to configure a base directory for document files
          var baseDirectory = GetDocumentBaseDirectory();
          filePath = Path.Combine(baseDirectory, filePath);
        }

        // Check if file exists
        if (!System.IO.File.Exists(filePath))
        {
          return NotFound(new { message = "File không tồn tại trên hệ thống" });
        }

        // Get file info
        var fileInfo = new FileInfo(filePath);
        var contentType = GetContentType(fileInfo.Extension);

        // Read file and return
        var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);

        return File(fileBytes, contentType, fileInfo.Name);
      }
      catch (Exception ex)
      {
        return StatusCode(500, new { message = "Có lỗi xảy ra khi đọc file", error = ex.Message });
      }
    }
    
    private string GetDocumentBaseDirectory()
    {
      // Configure this in appsettings.json or as environment variable
      // For now, we'll use a default path
      return _configuration.GetValue<string>("DocumentSettings:BaseDirectory") ?? @"C:\DocumentFiles";
    }

    private string GetContentType(string extension)
    {
      return extension.ToLowerInvariant() switch
      {
        ".pdf" => "application/pdf",
        ".doc" => "application/msword",
        ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".xls" => "application/vnd.ms-excel",
        ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".ppt" => "application/vnd.ms-powerpoint",
        ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".jpg" => "image/jpeg",
        ".jpeg" => "image/jpeg",
        ".png" => "image/png",
        ".gif" => "image/gif",
        ".txt" => "text/plain",
        ".rtf" => "application/rtf",
        _ => "application/octet-stream"
      };
    }
  }
}
