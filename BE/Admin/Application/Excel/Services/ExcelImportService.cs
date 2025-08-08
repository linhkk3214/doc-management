using Application.Excel.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;
using Shared.Classes;
using Shared.Interfaces;
using System.Globalization;
using System.Text.Json;

namespace Application.Excel.Services
{
    public interface IExcelImportService
    {
        Task<ExcelImportResult> ImportDocumentsFromExcelAsync(Stream excelStream);
        Task<byte[]> GenerateTemplateAsync();
    }

    public class ExcelImportService : IExcelImportService
    {
        private readonly ILogger<ExcelImportService> _logger;
        private readonly IDmPhongService _dmPhongService;
        private readonly IDmNhiemKyService _dmNhiemKyService;
        private readonly IDmLoaiVanBanService _dmLoaiVanBanService;
        private readonly IPortfoliosService _portfolioService;
        private readonly IDocumentsService _documentService;
        private readonly IDocumentsRepository _documentRepository;
        private readonly AdminDbContext _dbContext;
        private readonly CultureInfo vietNameseCulture = new CultureInfo("vi-VN");

        public ExcelImportService(
            ILogger<ExcelImportService> logger,
            IDmPhongService dmPhongService,
            IDmNhiemKyService dmNhiemKyService,
            IDmLoaiVanBanService dmLoaiVanBanService,
            IPortfoliosService portfolioService,
        IDocumentsService documentService,
        IDocumentsRepository documentRepository,
        AdminDbContext dbContext)
        {
            _logger = logger;
            _dmPhongService = dmPhongService;
            _dmNhiemKyService = dmNhiemKyService;
            _dmLoaiVanBanService = dmLoaiVanBanService;
            _portfolioService = portfolioService;
            _documentService = documentService;
            _documentRepository = documentRepository;
            _dbContext = dbContext;
        }

        public async Task<ExcelImportResult> ImportDocumentsFromExcelAsync(Stream excelStream)
        {
            var result = new ExcelImportResult();

            try
            {
                // Set EPPlus license for non-commercial use
#pragma warning disable CS0618 // Type or member is obsolete
                ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;
#pragma warning restore CS0618 // Type or member is obsolete

                using var package = new ExcelPackage(excelStream);
                var worksheet = package.Workbook.Worksheets.FirstOrDefault();

                if (worksheet == null)
                {
                    result.Errors.Add("Không tìm thấy sheet nào trong file Excel");
                    return result;
                }

                // Parse Excel rows
                var excelRows = ParseExcelRows(worksheet);

                if (!excelRows.Any())
                {
                    result.Errors.Add("Không có dữ liệu để import");
                    return result;
                }

                // Step 1: Collect all unique objects from all rows
                var uniquePhongs = CollectUniquePhongs(excelRows);
                var uniqueNhiemKys = CollectUniqueNhiemKys(excelRows);
                var uniqueLoaiVanBans = CollectUniqueLoaiVanBans(excelRows);
                var uniquePortfolios = CollectUniquePortfolios(excelRows);

                // Step 2-4: Create all data using bulk operations with transaction
                using var transaction = await _dbContext.Database.BeginTransactionAsync();

                try
                {
                    var createdPhongs = await CreatePhongsAsync(uniquePhongs);
                    var createdNhiemKys = await CreateNhiemKysAsync(uniqueNhiemKys);
                    var createdLoaiVanBans = await CreateLoaiVanBansAsync(uniqueLoaiVanBans);

                    // Step 3: Create portfolios using bulk operations
                    var portfoliosToCreate = new List<Portfolio>();

                    var lstMaHoSo = uniquePortfolios.Select(p => p.HoSoSo).Distinct().ToList();
                    // Loại bỏ các hồ sơ đã có
                    var existingMaHoSo = await _dbContext.Portfolios.Where(p => lstMaHoSo.Contains(p.Code))
                            .Select(p => new
                            {
                                p.Code,
                                p.Id
                            }).ToListAsync();
                    var dicHoSo = existingMaHoSo.ToDictionary(p => p.Code, p => p.Id);

                    foreach (var portfolioData in uniquePortfolios)
                    {
                        try
                        {
                            if (dicHoSo.ContainsKey(portfolioData.HoSoSo)) continue;
                            var phong = createdPhongs.FirstOrDefault(p =>
                                p.Ten.Equals(portfolioData.TenPhong, StringComparison.OrdinalIgnoreCase) ||
                                (!string.IsNullOrEmpty(portfolioData.PhongSo) && p.Ma.Equals(portfolioData.PhongSo, StringComparison.OrdinalIgnoreCase)));

                            var nhiemKy = createdNhiemKys.FirstOrDefault(n =>
                                n.Ten.Equals(portfolioData.NhiemKy, StringComparison.OrdinalIgnoreCase));

                            if (phong == null || nhiemKy == null)
                            {
                                result.Errors.Add($"Không tìm thấy phông hoặc nhiệm kỳ cho hồ sơ {portfolioData.TieuDeHoSo}");
                                continue;
                            }
                            string path = portfolioData.PathGoc;
                            // Loại bỏ path cuối trong đường dẫn (Đường dẫn có thể theo format / hoặc \\)
                            path = path.Split(new char[] { '/', '\\' }).SkipLast(1).Aggregate((a, b) => a + "\\" + b);
                            var portfolio = new Portfolio
                            {
                                Id = Guid.NewGuid(),
                                DepartmentId = phong.Id,
                                TermId = nhiemKy.Id,
                                CatalogNumber = portfolioData.MucLucSo,
                                BoxNumber = portfolioData.HopSo,
                                Code = portfolioData.HoSoSo,
                                Name = portfolioData.TieuDeHoSo,
                                StartDate = portfolioData.NgayBatDau != null ? DateTime.SpecifyKind(portfolioData.NgayBatDau.Value, DateTimeKind.Utc) : null,
                                EndDate = portfolioData.NgayKetThuc != null ? DateTime.SpecifyKind(portfolioData.NgayKetThuc.Value, DateTimeKind.Utc) : null,
                                OriginalAddress = portfolioData.DiaChiTaiLieuGoc,
                                OriginalPath = path,
                                RetentionPeriod = ParseRetentionPeriod(portfolioData.ThoiHanBaoQuan),
                                Created = DateTime.UtcNow,
                                Deleted = false
                            };

                            portfoliosToCreate.Add(portfolio);
                            dicHoSo[portfolio.Code] = portfolio.Id;
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, $"Lỗi chuẩn bị portfolio {portfolioData.TieuDeHoSo}");
                            result.Errors.Add($"Lỗi chuẩn bị portfolio {portfolioData.TieuDeHoSo}: {ex.Message}");
                        }
                    }

                    // Bulk insert portfolios
                    if (portfoliosToCreate.Any())
                    {
                        await _dbContext.Portfolios.AddRangeAsync(portfoliosToCreate);
                        result.ImportedPortfolios = portfoliosToCreate.Count;
                        _logger.LogInformation($"Prepared {portfoliosToCreate.Count} portfolios for bulk insert");
                    }

                    // Step 4: Create documents using bulk operations
                    var documentsToCreate = new List<Document>();

                    var lstDocumentRow = new List<ExcelDocumentRow>();
                    var lstSoKyHieu = new List<string>();

                    foreach (var documentRow in excelRows.Where(r => r.IsDocument))
                    {
                        lstDocumentRow.Add(documentRow);
                        lstSoKyHieu.Add(documentRow.SoKyHieu);
                    }

                    var existingSoKyHieu = await _dbContext.Documents.Where(d => lstSoKyHieu.Contains(d.SoKyHieu))
                            .Select(d => d.SoKyHieu)
                            .ToListAsync();

                    foreach (var documentRow in lstDocumentRow)
                    {
                        try
                        {
                            if (dicHoSo.TryGetValue(documentRow.HoSoSo, out var portfolioId))
                            {
                                if (existingSoKyHieu.Contains(documentRow.SoKyHieu)) continue;
                                // Get DmLoaiVanBan from the available list
                                Domain.Entities.DmLoaiVanBan? loaiVB = null;
                                if (!string.IsNullOrEmpty(documentRow.TheLoaiVanBan))
                                {
                                    loaiVB = createdLoaiVanBans.FirstOrDefault(l =>
                                        l.Ten.Equals(documentRow.TheLoaiVanBan, StringComparison.OrdinalIgnoreCase) ||
                                        (!string.IsNullOrEmpty(documentRow.KyHieuLoaiVanBan) && l.Ma.Equals(documentRow.KyHieuLoaiVanBan, StringComparison.OrdinalIgnoreCase)));
                                }

                                var document = new Document
                                {
                                    Id = Guid.NewGuid(),
                                    PortfolioId = portfolioId,
                                    DocumentTypeId = loaiVB?.Id ?? Guid.Empty,
                                    Title = !string.IsNullOrEmpty(documentRow.TrichYeu) ? documentRow.TrichYeu : "Không có tiêu đề",
                                    Summary = documentRow.TrichYeu,
                                    DocumentNumber = documentRow.SoVanBan,
                                    DocumentSymbol = documentRow.KyHieuVanBan,
                                    SoKyHieu = documentRow.SoKyHieu,
                                    IssuingAgency = documentRow.CoQuanBanHanh,
                                    SequenceNumber = documentRow.SoThuTuTrongHoSo,
                                    SignedDate = documentRow.NgayKy != null ? DateTime.SpecifyKind(documentRow.NgayKy.Value, DateTimeKind.Utc) : null,
                                    Signer = documentRow.NguoiKy,
                                    DocumentFormat = ParseDocumentFormat(documentRow.LoaiBan),
                                    PageCount = documentRow.SoLuongTrangVanBan,
                                    OriginalAddress = documentRow.DiaChiTaiLieuGoc,
                                    OriginalPath = documentRow.PathGoc,
                                    IsCopy = IsDocumentCopy(documentRow.LoaiBan),
                                    Created = DateTime.UtcNow,
                                    Deleted = false
                                };

                                documentsToCreate.Add(document);
                            }
                            else
                            {
                                result.Warnings.Add($"Không tìm thấy portfolio cho document: {documentRow.TrichYeu}");
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, $"Lỗi chuẩn bị document {documentRow.TrichYeu}");
                            result.Warnings.Add($"Lỗi chuẩn bị document {documentRow.TrichYeu}: {ex.Message}");
                        }
                    }

                    // Bulk insert documents
                    if (documentsToCreate.Any())
                    {
                        await _dbContext.Documents.AddRangeAsync(documentsToCreate);
                        result.ImportedDocuments = documentsToCreate.Count;
                        _logger.LogInformation($"Prepared {documentsToCreate.Count} documents for bulk insert");
                    }

                    // Save all changes in one transaction
                    await _dbContext.SaveChangesAsync();

                    await transaction.CommitAsync();
                    _logger.LogInformation($"Successfully committed transaction with {result.ImportedPortfolios} portfolios and {result.ImportedDocuments} documents");
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, "Transaction failed, rolling back all changes");
                    throw;
                }

                result.Success = result.ImportedDocuments > 0;
                result.Message = result.Success
                    ? $"Import thành công {result.ImportedDocuments} documents từ {result.ImportedPortfolios} portfolios"
                    : "Không có dữ liệu nào được import";

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi import Excel");
                result.Errors.Add($"Lỗi import Excel: {ex.Message}");
                return result;
            }
        }

        private List<ExcelDocumentRow> ParseExcelRows(ExcelWorksheet worksheet)
        {
            var rows = new List<ExcelDocumentRow>();
            var startRow = 2; // Bỏ qua header row
            var endRow = worksheet.Dimension?.End?.Row ?? 0;

            for (int row = startRow; row <= endRow; row++)
            {
                try
                {
                    // Check if row is empty
                    if (string.IsNullOrWhiteSpace(GetCellStringValue(worksheet, row, 4))) // Column D (TenPhong)
                        continue;

                    var excelRow = new ExcelDocumentRow
                    {
                        // Column mapping as specified in the DTOs
                        TenPhong = GetCellStringValue(worksheet, row, 4), // Column D
                        PhongSo = GetCellStringValue(worksheet, row, 5), // Column E
                        NhiemKy = GetCellStringValue(worksheet, row, 6), // Column F
                        MucLucSo = GetCellIntValue(worksheet, row, 7), // Column G
                        HopSo = GetCellIntValue(worksheet, row, 8), // Column H
                        HoSoSo = GetCellStringValue(worksheet, row, 9), // Column I
                        ThoiHanBaoQuan = GetCellStringValue(worksheet, row, 10), // Column J
                        TieuDeHoSo = GetCellStringValue(worksheet, row, 11), // Column K
                        NgayBatDau = GetCellDateValue(worksheet, row, 12), // Column L
                        NgayKetThuc = GetCellDateValue(worksheet, row, 13), // Column M
                        TongSoVanBan = GetCellIntValue(worksheet, row, 14), // Column N
                        SoTo = GetCellIntValue(worksheet, row, 15), // Column O
                        SoTrang = GetCellIntValue(worksheet, row, 16), // Column P
                        // Skip Q
                        CoQuanBanHanh = GetCellStringValue(worksheet, row, 18), // Column R
                        SoVanBan = GetCellIntValue(worksheet, row, 19), // Column S
                        KyHieuVanBan = GetCellStringValue(worksheet, row, 20), // Column T
                        // Skip U,V,W
                        NgayKy = GetCellDateValue(worksheet, row, 24), // Column X
                        TheLoaiVanBan = GetCellStringValue(worksheet, row, 25), // Column Y
                        KyHieuLoaiVanBan = GetCellStringValue(worksheet, row, 26), // Column Z
                        TrichYeu = GetCellStringValue(worksheet, row, 27), // Column AA
                        NguoiKy = GetCellStringValue(worksheet, row, 28), // Column AB
                        LoaiBan = GetCellStringValue(worksheet, row, 29), // Column AC
                        SoLuongTrangVanBan = GetCellIntValue(worksheet, row, 30), // Column AD
                        // Skip AE, AF
                        DiaChiTaiLieuGoc = GetCellStringValue(worksheet, row, 33), // Column AG
                        // Skip AH
                        SoThuTuTrongHoSo = GetCellIntValue(worksheet, row, 35), // Column AI
                        // Skip AJ to AP
                        PathGoc = GetCellStringValue(worksheet, row, 43), // Column AQ
                    };

                    rows.Add(excelRow);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Lỗi parse row {row}");
                }
            }

            return rows;
        }

        #region Collection Methods

        private List<Domain.Entities.DmPhong> CollectUniquePhongs(List<ExcelDocumentRow> excelRows)
        {
            var uniquePhongs = new List<Domain.Entities.DmPhong>();
            var processedKeys = new HashSet<string>();

            foreach (var row in excelRows)
            {
                if (string.IsNullOrEmpty(row.TenPhong)) continue;

                var key = $"{row.TenPhong}_{row.PhongSo}";
                if (processedKeys.Add(key))
                {
                    uniquePhongs.Add(new Domain.Entities.DmPhong
                    {
                        Id = Guid.NewGuid(),
                        Ten = row.TenPhong,
                        Ma = !string.IsNullOrEmpty(row.PhongSo) ? row.PhongSo : row.TenPhong.Substring(0, Math.Min(10, row.TenPhong.Length)).ToUpper(),
                        Created = DateTime.UtcNow,
                        Deleted = false
                    });
                }
            }

            return uniquePhongs;
        }

        private List<Domain.Entities.DmNhiemKy> CollectUniqueNhiemKys(List<ExcelDocumentRow> excelRows)
        {
            var uniqueNhiemKys = new List<Domain.Entities.DmNhiemKy>();
            var processedNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var row in excelRows)
            {
                if (string.IsNullOrEmpty(row.NhiemKy)) continue;

                if (processedNames.Add(row.NhiemKy))
                {
                    uniqueNhiemKys.Add(new Domain.Entities.DmNhiemKy
                    {
                        Id = Guid.NewGuid(),
                        Ten = row.NhiemKy,
                        Created = DateTime.UtcNow,
                        Deleted = false
                    });
                }
            }

            return uniqueNhiemKys;
        }

        private List<Domain.Entities.DmLoaiVanBan> CollectUniqueLoaiVanBans(List<ExcelDocumentRow> excelRows)
        {
            var uniqueLoaiVanBans = new List<Domain.Entities.DmLoaiVanBan>();
            var processedKeys = new HashSet<string>();

            foreach (var row in excelRows)
            {
                if (string.IsNullOrEmpty(row.TheLoaiVanBan)) continue;

                var key = $"{row.TheLoaiVanBan}_{row.KyHieuLoaiVanBan}";
                if (processedKeys.Add(key))
                {
                    uniqueLoaiVanBans.Add(new Domain.Entities.DmLoaiVanBan
                    {
                        Id = Guid.NewGuid(),
                        Ten = row.TheLoaiVanBan,
                        Ma = !string.IsNullOrEmpty(row.KyHieuLoaiVanBan) ? row.KyHieuLoaiVanBan : row.TheLoaiVanBan.Substring(0, Math.Min(10, row.TheLoaiVanBan.Length)).ToUpper(),
                        Created = DateTime.UtcNow,
                        Deleted = false
                    });
                }
            }

            return uniqueLoaiVanBans;
        }

        private List<ExcelDocumentRow> CollectUniquePortfolios(List<ExcelDocumentRow> excelRows)
        {
            return excelRows
                .GroupBy(r => new { r.TenPhong, r.PhongSo, r.NhiemKy, r.HoSoSo, r.TieuDeHoSo })
                .Select(g => g.First())
                .ToList();
        }

        private async Task<List<Domain.Entities.DmPhong>> CreatePhongsAsync(List<Domain.Entities.DmPhong> uniquePhongs)
        {
            if (!uniquePhongs.Any()) return new List<Domain.Entities.DmPhong>();

            // Get existing data
            var existingResult = await _dmPhongService.GetData(new QueryData(), null);
            var existingItems = existingResult.Success ? existingResult.Data! : new List<Domain.Entities.DmPhong>();

            var toCreate = new List<Domain.Entities.DmPhong>();
            var allItems = new List<Domain.Entities.DmPhong>();

            foreach (var item in uniquePhongs)
            {
                // Check if item already exists
                var existing = existingItems.FirstOrDefault(p => p.Ten.Equals(item.Ten, StringComparison.OrdinalIgnoreCase) ||
                    (!string.IsNullOrEmpty(item.Ma) && p.Ma.Equals(item.Ma, StringComparison.OrdinalIgnoreCase)));

                if (existing == null)
                {
                    item.STT = existingItems.Count + toCreate.Count + 1;
                    toCreate.Add(item);
                }
                else
                {
                    if (!allItems.Contains(existing))
                        allItems.Add(existing);
                }
            }

            // Add new items to context (will be saved with transaction)
            if (toCreate.Any())
            {
                await _dbContext.DmPhongs.AddRangeAsync(toCreate);
                allItems.AddRange(toCreate);
                _logger.LogInformation($"Prepared {toCreate.Count} phongs for bulk insert");
            }

            // Add existing items
            allItems.AddRange(existingItems.Where(e => !allItems.Contains(e)));
            return allItems;
        }

        private async Task<List<Domain.Entities.DmNhiemKy>> CreateNhiemKysAsync(List<Domain.Entities.DmNhiemKy> uniqueNhiemKys)
        {
            if (!uniqueNhiemKys.Any()) return new List<Domain.Entities.DmNhiemKy>();

            // Get existing data
            var existingResult = await _dmNhiemKyService.GetData(new QueryData(), null);
            var existingItems = existingResult.Success ? existingResult.Data! : new List<Domain.Entities.DmNhiemKy>();

            var toCreate = new List<Domain.Entities.DmNhiemKy>();
            var allItems = new List<Domain.Entities.DmNhiemKy>();

            foreach (var item in uniqueNhiemKys)
            {
                // Check if item already exists
                var existing = existingItems.FirstOrDefault(n => n.Ten.Equals(item.Ten, StringComparison.OrdinalIgnoreCase));

                if (existing == null)
                {
                    toCreate.Add(item);
                }
                else
                {
                    if (!allItems.Contains(existing))
                        allItems.Add(existing);
                }
            }

            // Add new items to context (will be saved with transaction)
            if (toCreate.Any())
            {
                await _dbContext.DmNhiemKys.AddRangeAsync(toCreate);
                allItems.AddRange(toCreate);
                _logger.LogInformation($"Prepared {toCreate.Count} nhiemKys for bulk insert");
            }

            // Add existing items
            allItems.AddRange(existingItems.Where(e => !allItems.Contains(e)));
            return allItems;
        }

        private async Task<List<Domain.Entities.DmLoaiVanBan>> CreateLoaiVanBansAsync(List<Domain.Entities.DmLoaiVanBan> uniqueLoaiVanBans)
        {
            if (!uniqueLoaiVanBans.Any()) return new List<Domain.Entities.DmLoaiVanBan>();

            // Get existing data
            var existingResult = await _dmLoaiVanBanService.GetData(new QueryData(), null);
            var existingItems = existingResult.Success ? existingResult.Data! : new List<Domain.Entities.DmLoaiVanBan>();

            var toCreate = new List<Domain.Entities.DmLoaiVanBan>();
            var allItems = new List<Domain.Entities.DmLoaiVanBan>();

            foreach (var item in uniqueLoaiVanBans)
            {
                // Check if item already exists
                var existing = existingItems.FirstOrDefault(l => l.Ten.Equals(item.Ten, StringComparison.OrdinalIgnoreCase) ||
                    (!string.IsNullOrEmpty(item.Ma) && l.Ma.Equals(item.Ma, StringComparison.OrdinalIgnoreCase)));

                if (existing == null)
                {
                    item.STT = existingItems.Count + toCreate.Count + 1;
                    toCreate.Add(item);
                }
                else
                {
                    if (!allItems.Contains(existing))
                        allItems.Add(existing);
                }
            }

            // Add new items to context (will be saved with transaction)
            if (toCreate.Any())
            {
                await _dbContext.DmLoaiVanBans.AddRangeAsync(toCreate);
                allItems.AddRange(toCreate);
                _logger.LogInformation($"Prepared {toCreate.Count} loaiVanBans for bulk insert");
            }

            // Add existing items
            allItems.AddRange(existingItems.Where(e => !allItems.Contains(e)));
            return allItems;
        }

        #endregion

        private int ParseRetentionPeriod(string thoiHan)
        {
            if (string.IsNullOrEmpty(thoiHan)) return 0;

            // Try to extract number from string
            var numbers = new string(thoiHan.Where(char.IsDigit).ToArray());
            return int.TryParse(numbers, out int result) ? result : 0;
        }

        private int ParseDocumentFormat(string loaiBan)
        {
            if (string.IsNullOrEmpty(loaiBan)) return 1;

            loaiBan = loaiBan.ToLower().Trim();
            if (loaiBan.Contains("chính") || loaiBan.Contains("gốc")) return 1; // Bản chính
            if (loaiBan.Contains("sao") || loaiBan.Contains("copy")) return 2; // Bản sao

            return 1; // Default to bản chính
        }

        private bool IsDocumentCopy(string loaiBan)
        {
            if (string.IsNullOrEmpty(loaiBan)) return false;

            loaiBan = loaiBan.ToLower().Trim();
            return loaiBan.Contains("sao") || loaiBan.Contains("copy");
        }

        public async Task<byte[]> GenerateTemplateAsync()
        {
            // Set EPPlus license for non-commercial use
#pragma warning disable CS0618 // Type or member is obsolete
            ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;
#pragma warning restore CS0618 // Type or member is obsolete

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Template");

            // Create headers based on the column mapping
            var headers = new[]
            {
                "A", "B", "C", // A-C
                "Tên phông", // D
                "Phông số", // E
                "Nhiệm kỳ", // F
                "Mục lục số", // G
                "Hộp số", // H
                "Hồ sơ số", // I
                "Thời hạn bảo quản", // J
                "Tiêu đề hồ sơ", // K
                "Ngày bắt đầu", // L
                "Ngày kết thúc", // M
                "Tổng số văn bản", // N
                "Số tờ", // O
                "Số trang", // P
                "Q", // Q
                "Cơ quan ban hành", // R
                "Số văn bản", // S
                "Ký hiệu văn bản", // T
                "U", "V", "W", // U-W
                "Ngày ký", // X
                "Thể loại văn bản", // Y
                "Ký hiệu loại văn bản", // Z
                "Trích yếu", // AA
                "Người ký", // AB
                "Loại bản", // AC
                "Số lượng trang văn bản", // AD
                "AE", "AF", // AE-AF
                "Địa chỉ tài liệu gốc", // AG
                "AH", // AH
                "Số thứ tự trong hồ sơ", // AI
                "AJ", "AK", "AL", "AM", "AN", "AO", "AP", // AJ-AP
                "Path gốc" // AQ
            };

            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cells[1, i + 1].Value = headers[i];
            }

            // Format header row
            using (var range = worksheet.Cells[1, 1, 1, headers.Length])
            {
                range.Style.Font.Bold = true;
                range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
            }

            // Auto fit columns
            worksheet.Cells.AutoFitColumns();

            return await package.GetAsByteArrayAsync();
        }

        #region Helper methods

        private string GetCellStringValue(ExcelWorksheet worksheet, int row, int col)
        {
            return worksheet.Cells[row, col].Value?.ToString()?.Trim() ?? string.Empty;
        }

        private int GetCellIntValue(ExcelWorksheet worksheet, int row, int col)
        {
            var value = worksheet.Cells[row, col].Value?.ToString()?.Trim();
            return int.TryParse(value, out int result) ? result : 0;
        }

        private DateTime? GetCellDateValue(ExcelWorksheet worksheet, int row, int col)
        {
            var cellValue = worksheet.Cells[row, col].Value;

            if (cellValue == null) return null;

            // If it's already a DateTime
            if (cellValue is DateTime dateTime)
                return dateTime;

            // Try to parse as string
            var stringValue = cellValue.ToString()?.Trim();
            if (string.IsNullOrEmpty(stringValue)) return null;
            if (DateTime.TryParse(stringValue, vietNameseCulture, DateTimeStyles.None, out DateTime result))
                return result;

            return null;
        }

        #endregion
    }
}
