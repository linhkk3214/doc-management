using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Infrastructure
{
    public static class DatabaseInitializer
    {
        /// <summary>
        /// Khởi tạo database và áp dụng migrations
        /// </summary>
        public static async Task InitializeDatabaseAsync(this IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AdminDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<AdminDbContext>>();

            try
            {
                logger.LogInformation("Đang khởi tạo database...");
                
                // Tạo database nếu chưa tồn tại
                await context.Database.EnsureCreatedAsync();
                
                logger.LogInformation("Database đã được khởi tạo thành công!");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Lỗi khi khởi tạo database: {Message}", ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Áp dụng migrations để cập nhật database
        /// </summary>
        public static async Task ApplyMigrationsAsync(this IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AdminDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<AdminDbContext>>();

            try
            {
                logger.LogInformation("Đang áp dụng migrations...");
                
                // Áp dụng tất cả migrations chưa được áp dụng
                await context.Database.MigrateAsync();
                
                logger.LogInformation("Migrations đã được áp dụng thành công!");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Lỗi khi áp dụng migrations: {Message}", ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Xóa và tạo lại database (chỉ dùng cho development)
        /// </summary>
        public static async Task RecreateDatabase(this IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AdminDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<AdminDbContext>>();

            try
            {
                logger.LogWarning("Đang xóa và tạo lại database...");
                
                // Xóa database
                await context.Database.EnsureDeletedAsync();
                
                // Tạo lại database
                await context.Database.EnsureCreatedAsync();
                
                logger.LogInformation("Database đã được tạo lại thành công!");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Lỗi khi tạo lại database: {Message}", ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Seed dữ liệu mẫu
        /// </summary>
        public static async Task SeedDataAsync(this IServiceProvider serviceProvider)
        {
            return;
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AdminDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<AdminDbContext>>();

            try
            {
                // Đảm bảo database được tạo với tất cả bảng mới
                logger.LogInformation("Đang đảm bảo database được cập nhật...");
                
                // Kiểm tra xem bảng Portfolio có tồn tại không
                var canConnectToPortfolio = true;
                try
                {
                    await context.Portfolios.AnyAsync();
                    await context.DmPhongs.AnyAsync();
                }
                catch (Exception)
                {
                    canConnectToPortfolio = false;
                }

                // Nếu không thể truy cập bảng Portfolio, tức là schema đã thay đổi, cần recreate database
                if (!canConnectToPortfolio)
                {
                    logger.LogWarning("Schema database đã thay đổi, đang tạo lại database...");
                    await context.Database.EnsureDeletedAsync();
                    await context.Database.EnsureCreatedAsync();
                    logger.LogInformation("Database đã được tạo lại với schema mới!");
                }
                else
                {
                    await context.Database.EnsureCreatedAsync();
                }

                // Kiểm tra xem đã có dữ liệu chưa
                if (!await context.Cities.AnyAsync())
                {
                    logger.LogInformation("Đang seed dữ liệu mẫu...");

                    // Thêm dữ liệu mẫu cho Cities
                    var cityHanoi = Guid.NewGuid();
                    var cityHCM = Guid.NewGuid();
                    var cityDaNang = Guid.NewGuid();

                    var cities = new[]
                    {
                        new Domain.Entities.City
                        {
                            Id = cityHanoi,
                            Name = "Hà Nội",
                            Code = "HN",
                            Type = 1,
                            Deleted = false,
                            Created = DateTime.UtcNow
                        },
                        new Domain.Entities.City
                        {
                            Id = cityHCM,
                            Name = "Hồ Chí Minh",
                            Code = "HCM",
                            Type = 1,
                            Deleted = false,
                            Created = DateTime.UtcNow
                        },
                        new Domain.Entities.City
                        {
                            Id = cityDaNang,
                            Name = "Đà Nẵng",
                            Code = "DN",
                            Type = 1,
                            Deleted = false,
                            Created = DateTime.UtcNow
                        }
                    };

                    context.Cities.AddRange(cities);
                    await context.SaveChangesAsync();

                    // Thêm dữ liệu mẫu cho Districts
                    var districts = new[]
                    {
                        new Domain.Entities.District
                        {
                            Id = Guid.NewGuid(),
                            Name = "Ba Đình",
                            Code = "BD",
                            IdCity = cityHanoi,
                            Population = 200000,
                            HappyRate = 85.5m,
                            Deleted = false,
                            Created = DateTime.UtcNow
                        },
                        new Domain.Entities.District
                        {
                            Id = Guid.NewGuid(),
                            Name = "Hoàn Kiếm",
                            Code = "HK",
                            IdCity = cityHanoi,
                            Population = 150000,
                            HappyRate = 90.2m,
                            Deleted = false,
                            Created = DateTime.UtcNow
                        },
                        new Domain.Entities.District
                        {
                            Id = Guid.NewGuid(),
                            Name = "Quận 1",
                            Code = "Q1",
                            IdCity = cityHCM,
                            Population = 300000,
                            HappyRate = 88.7m,
                            Deleted = false,
                            Created = DateTime.UtcNow
                        }
                    };

                    context.Districts.AddRange(districts);
                    await context.SaveChangesAsync();
                }

                // Thêm dữ liệu mẫu cho DM_Phong (Phông lưu trữ)
                if (!await context.DmPhongs.AnyAsync())
                {
                    logger.LogInformation("Đang seed dữ liệu mẫu cho Phông lưu trữ...");
                    
                    var dmPhongs = new[]
                    {
                        new Domain.Entities.DmPhong
                        {
                            Id = Guid.NewGuid(),
                            STT = 1,
                            Ma = "P001",
                            Ten = "Phông văn bản hành chính",
                            Deleted = false,
                            Created = DateTime.UtcNow
                        },
                        new Domain.Entities.DmPhong
                        {
                            Id = Guid.NewGuid(),
                            STT = 2,
                            Ma = "P002",
                            Ten = "Phông văn bản tài chính",
                            Deleted = false,
                            Created = DateTime.UtcNow
                        },
                        new Domain.Entities.DmPhong
                        {
                            Id = Guid.NewGuid(),
                            STT = 3,
                            Ma = "P003",
                            Ten = "Phông văn bản nhân sự",
                            Deleted = false,
                            Created = DateTime.UtcNow
                        },
                        new Domain.Entities.DmPhong
                        {
                            Id = Guid.NewGuid(),
                            STT = 4,
                            Ma = "P004",
                            Ten = "Phông văn bản pháp lý",
                            Deleted = false,
                            Created = DateTime.UtcNow
                        }
                    };

                    context.DmPhongs.AddRange(dmPhongs);
                    await context.SaveChangesAsync();
                }

                // Thêm dữ liệu mẫu cho DM_LoaiVanBan (Loại văn bản)
                if (!await context.DmLoaiVanBans.AnyAsync())
                {
                    logger.LogInformation("Đang seed dữ liệu mẫu cho Loại văn bản...");
                    
                    var dmLoaiVanBans = new[]
                    {
                        new Domain.Entities.DmLoaiVanBan
                        {
                            Id = Guid.NewGuid(),
                            STT = 1,
                            Ma = "QD",
                            Ten = "Quyết định",
                            Deleted = false,
                            Created = DateTime.UtcNow
                        },
                        new Domain.Entities.DmLoaiVanBan
                        {
                            Id = Guid.NewGuid(),
                            STT = 2,
                            Ma = "TB",
                            Ten = "Thông báo",
                            Deleted = false,
                            Created = DateTime.UtcNow
                        },
                        new Domain.Entities.DmLoaiVanBan
                        {
                            Id = Guid.NewGuid(),
                            STT = 3,
                            Ma = "BC",
                            Ten = "Báo cáo",
                            Deleted = false,
                            Created = DateTime.UtcNow
                        },
                        new Domain.Entities.DmLoaiVanBan
                        {
                            Id = Guid.NewGuid(),
                            STT = 4,
                            Ma = "CV",
                            Ten = "Công văn",
                            Deleted = false,
                            Created = DateTime.UtcNow
                        },
                        new Domain.Entities.DmLoaiVanBan
                        {
                            Id = Guid.NewGuid(),
                            STT = 5,
                            Ma = "HD",
                            Ten = "Hướng dẫn",
                            Deleted = false,
                            Created = DateTime.UtcNow
                        },
                        new Domain.Entities.DmLoaiVanBan
                        {
                            Id = Guid.NewGuid(),
                            STT = 6,
                            Ma = "KH",
                            Ten = "Kế hoạch",
                            Deleted = false,
                            Created = DateTime.UtcNow
                        }
                    };

                    context.DmLoaiVanBans.AddRange(dmLoaiVanBans);
                    await context.SaveChangesAsync();
                }

                // Thêm dữ liệu mẫu cho DM_NhiemKy (Nhiệm kỳ)
                if (!await context.DmNhiemKys.AnyAsync())
                {
                    logger.LogInformation("Đang seed dữ liệu mẫu cho Nhiệm kỳ...");
                    
                    var dmNhiemKys = new[]
                    {
                        new Domain.Entities.DmNhiemKy
                        {
                            Id = Guid.NewGuid(),
                            Ten = "Nhiệm kỳ 2020-2025",
                            Deleted = false,
                            Created = DateTime.UtcNow
                        },
                        new Domain.Entities.DmNhiemKy
                        {
                            Id = Guid.NewGuid(),
                            Ten = "Nhiệm kỳ 2025-2030",
                            Deleted = false,
                            Created = DateTime.UtcNow
                        },
                        new Domain.Entities.DmNhiemKy
                        {
                            Id = Guid.NewGuid(),
                            Ten = "Nhiệm kỳ 2015-2020",
                            Deleted = false,
                            Created = DateTime.UtcNow
                        }
                    };

                    context.DmNhiemKys.AddRange(dmNhiemKys);
                    await context.SaveChangesAsync();
                }

                if (!await context.Portfolios.AnyAsync())
                {
                    logger.LogInformation("Đang seed dữ liệu mẫu cho Portfolios...");
                    
                    // Lấy ID của các danh mục đã tạo
                    var phongHanhChinh = await context.DmPhongs.FirstOrDefaultAsync(p => p.Ma == "P001");
                    var phongTaiChinh = await context.DmPhongs.FirstOrDefaultAsync(p => p.Ma == "P002");
                    var nhiemKyHienTai = await context.DmNhiemKys.FirstOrDefaultAsync(n => n.Ten.Contains("2020-2025"));

                    // Thêm dữ liệu mẫu cho Portfolios
                    var portfolio1Id = Guid.NewGuid();
                    var portfolio2Id = Guid.NewGuid();

                    var portfolios = new[]
                    {
                        new Domain.Entities.Portfolio
                        {
                            Id = portfolio1Id,
                            DepartmentId = phongHanhChinh?.Id ?? Guid.NewGuid(),
                            TermId = nhiemKyHienTai?.Id ?? Guid.NewGuid(),
                            CatalogNumber = 1,
                            BoxNumber = 1,
                            Code = "HS001",
                            Name = "Hồ sơ văn bản hành chính 2024",
                            StartDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                            EndDate = new DateTime(2024, 12, 31, 0, 0, 0, DateTimeKind.Utc),
                            RetentionPeriod = 10, // 10 năm
                            Deleted = false,
                            Created = DateTime.UtcNow
                        },
                        new Domain.Entities.Portfolio
                        {
                            Id = portfolio2Id,
                            DepartmentId = phongTaiChinh?.Id ?? Guid.NewGuid(),
                            TermId = nhiemKyHienTai?.Id ?? Guid.NewGuid(),
                            CatalogNumber = 2,
                            BoxNumber = 1,
                            Code = "HS002",
                            Name = "Hồ sơ tài chính 2024",
                            StartDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                            EndDate = new DateTime(2024, 12, 31, 0, 0, 0, DateTimeKind.Utc),
                            RetentionPeriod = 0, // Vĩnh viễn
                            Deleted = false,
                            Created = DateTime.UtcNow
                        }
                    };

                    context.Portfolios.AddRange(portfolios);
                    await context.SaveChangesAsync();

                    // Thêm dữ liệu mẫu cho Documents
                    // Lấy ID của các loại văn bản
                    var loaiQuyetDinh = await context.DmLoaiVanBans.FirstOrDefaultAsync(l => l.Ma == "QD");
                    var loaiThongBao = await context.DmLoaiVanBans.FirstOrDefaultAsync(l => l.Ma == "TB");
                    var loaiBaoCao = await context.DmLoaiVanBans.FirstOrDefaultAsync(l => l.Ma == "BC");
                    
                    var documents = new[]
                    {
                    new Domain.Entities.Document
                    {
                        Id = Guid.NewGuid(),
                        PortfolioId = portfolio1Id,
                        DocumentTypeId = loaiQuyetDinh?.Id ?? Guid.NewGuid(),
                        Title = "Quyết định số 01/2024/QĐ-UBND về việc ban hành quy định quản lý hành chính",
                        Summary = "Quyết định ban hành quy định về quản lý hành chính công trong các cơ quan nhà nước",
                        DocumentNumber = 1,
                        DocumentSymbol = "01/2024/QĐ-UBND",
                        IssuingAgency = "Ủy ban nhân dân thành phố",
                        SequenceNumber = 1,
                        SignedDate = new DateTime(2024, 1, 15, 0, 0, 0, DateTimeKind.Utc),
                        Signer = "Chủ tịch UBND",
                        DocumentFormat = 1, // Bản chính
                        PageCount = 5,
                        OriginalAddress = "Phòng Tổ chức - Hành chính",
                        OriginalPath = "/documents/2024/01/decision-01-2024.pdf",
                        Deleted = false,
                        Created = DateTime.UtcNow
                    },
                    new Domain.Entities.Document
                    {
                        Id = Guid.NewGuid(),
                        PortfolioId = portfolio1Id,
                        DocumentTypeId = loaiThongBao?.Id ?? Guid.NewGuid(),
                        Title = "Thông báo số 05/2024/TB-UBND về việc triển khai kế hoạch năm 2024",
                        Summary = "Thông báo triển khai các nhiệm vụ trọng tâm trong năm 2024",
                        DocumentNumber = 5,
                        DocumentSymbol = "05/2024/TB-UBND",
                        IssuingAgency = "Ủy ban nhân dân thành phố",
                        SequenceNumber = 2,
                        SignedDate = new DateTime(2024, 1, 20, 0, 0, 0, DateTimeKind.Utc),
                        Signer = "Phó Chủ tịch UBND",
                        DocumentFormat = 1, // Bản chính
                        PageCount = 3,
                        OriginalAddress = "Phòng Kế hoạch - Đầu tư",
                        OriginalPath = "/documents/2024/01/notice-05-2024.pdf",
                        Deleted = false,
                        Created = DateTime.UtcNow
                    },
                    new Domain.Entities.Document
                    {
                        Id = Guid.NewGuid(),
                        PortfolioId = portfolio2Id,
                        DocumentTypeId = loaiBaoCao?.Id ?? Guid.NewGuid(),
                        Title = "Báo cáo tài chính quý I năm 2024",
                        Summary = "Báo cáo tình hình thu chi ngân sách và tài chính công quý I/2024",
                        DocumentNumber = 10,
                        DocumentSymbol = "10/2024/BC-TC",
                        IssuingAgency = "Phòng Tài chính - Kế hoạch",
                        SequenceNumber = 1,
                        SignedDate = new DateTime(2024, 3, 31, 0, 0, 0, DateTimeKind.Utc),
                        Signer = "Trưởng phòng Tài chính",
                        DocumentFormat = 1, // Bản chính
                        PageCount = 15,
                        OriginalAddress = "Phòng Tài chính - Kế hoạch",
                        OriginalPath = "/documents/2024/03/finance-report-q1-2024.pdf",
                        Deleted = false,
                        Created = DateTime.UtcNow
                    }
                };

                    context.Documents.AddRange(documents);
                    await context.SaveChangesAsync();
                }
                logger.LogInformation("Seed dữ liệu mẫu thành công!");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Lỗi khi seed dữ liệu: {Message}", ex.Message);
                throw;
            }
        }
    }
}
