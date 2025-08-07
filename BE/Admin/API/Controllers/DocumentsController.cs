using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Classes;
using System.Text.Json;
using Application.Excel.Services;
using Application.Excel.DTOs;
using Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Admin.Controllers
{
  public class DocumentsController : BaseController<IDocumentsService, Document>
  {
    private readonly IExcelImportService _excelImportService;
    private readonly IDocumentsService _documentsService;
    private readonly IConfiguration _configuration;
    private readonly AdminDbContext _dbContext;

    public DocumentsController(IServiceProvider serviceProvider, IMediator mediator, IExcelImportService excelImportService, IConfiguration configuration,
    AdminDbContext dbContext) : base(serviceProvider, mediator)
    {
      _excelImportService = excelImportService;
      _documentsService = serviceProvider.GetRequiredService<IDocumentsService>();
      _configuration = configuration;
      _dbContext = dbContext;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> GetData(Guid id, [FromBody] Document model)
    {
      Document item = await _dbContext.Documents.Where(q => q.Id == id).FirstOrDefaultAsync();
      if (item == null)
        return NotFound();
      item.TrangSo = model.TrangSo;
      item.SequenceNumber = model.SequenceNumber;
      item.Title = model.Title;
      item.DocumentSymbol = model.DocumentSymbol;
      item.DocumentNumber = model.DocumentNumber;
      item.IssuingAgency = model.IssuingAgency;
      item.SignedDate = model.SignedDate;
      item.DocumentTypeId = model.DocumentTypeId;
      item.Summary = model.Summary;
      item.Signer = model.Signer;
      item.IsCopy = model.IsCopy;
      return ResponseResult(
        await _documentsService.Update(item)
      );
    }

    /// <summary>
    /// Import documents from Excel file
    /// </summary>
    [HttpPost("import-excel")]
    public async Task<IActionResult> ImportFromExcel(IFormFile file)
    {
      try
      {
        if (file == null || file.Length == 0)
        {
          return BadRequest(new ExcelImportResult
          {
            Success = false,
            Message = "File không được để trống",
            Errors = new List<string> { "Vui lòng chọn file Excel để import" }
          });
        }

        // Validate file type
        var allowedExtensions = new[] { ".xlsx", ".xls" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        
        if (!allowedExtensions.Contains(fileExtension))
        {
          return BadRequest(new ExcelImportResult
          {
            Success = false,
            Message = "Định dạng file không hợp lệ",
            Errors = new List<string> { "Chỉ chấp nhận file Excel (.xlsx, .xls)" }
          });
        }

        // Check file size (50MB limit)
        if (file.Length > 50 * 1024 * 1024)
        {
          return BadRequest(new ExcelImportResult
          {
            Success = false,
            Message = "File quá lớn",
            Errors = new List<string> { "File không được vượt quá 50MB" }
          });
        }

        using var stream = file.OpenReadStream();
        var result = await _excelImportService.ImportDocumentsFromExcelAsync(stream);
        
        return Ok(result);
      }
      catch (Exception ex)
      {
        return StatusCode(500, new ExcelImportResult
        {
          Success = false,
          Message = "Có lỗi xảy ra trong quá trình import",
          Errors = new List<string> { ex.Message }
        });
      }
    }

    /// <summary>
    /// Download Excel import template
    /// </summary>
    [HttpGet("import-excel/template")]
    public async Task<IActionResult> DownloadImportTemplate()
    {
      try
      {
        var templateBytes = await _excelImportService.GenerateTemplateAsync();
        
        return File(
          templateBytes, 
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          $"Template_Import_Document_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx"
        );
      }
      catch (Exception ex)
      {
        return StatusCode(500, new { message = "Không thể tạo template", error = ex.Message });
      }
    }

    // Có thể thêm các action tùy chỉnh cho Document ở đây nếu cần
    // Ví dụ: Lấy danh sách tài liệu theo portfolio, tìm kiếm theo symbol, etc.
    
    //[HttpGet("by-portfolio/{portfolioId}")]
    //public async Task<IActionResult> GetByPortfolio(Guid portfolioId)
    //{
    //    // Custom logic để lấy documents theo portfolio
    //    return Ok();
    //}

    //[HttpGet("by-symbol/{symbol}")]
    //public async Task<IActionResult> GetBySymbol(string symbol)
    //{
    //    // Custom logic để tìm kiếm tài liệu theo ký hiệu
    //    return Ok();
    //}

    /// <summary>
    /// View file by document ID
    /// </summary>
    [HttpGet("{id}/file")]
    public async Task<IActionResult> ViewFile(Guid id)
    {
      try
      {
        // Get document from database
        var document = await _documentsService.GetById(id, default);
        
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

    /// <summary>
    /// Download file by document ID
    /// </summary>
    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadFile(Guid id)
    {
      try
      {
        // Get document from database
        var document = await _documentsService.GetById(id, default);
        
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
        var contentType = "application/octet-stream"; // Force download

        // Read file and return for download
        var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
        
        var fileName = $"{doc.DocumentSymbol}_{doc.Title}.{fileInfo.Extension.TrimStart('.')}";
        
        return File(fileBytes, contentType, fileName);
      }
      catch (Exception ex)
      {
        return StatusCode(500, new { message = "Có lỗi xảy ra khi tải file", error = ex.Message });
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
