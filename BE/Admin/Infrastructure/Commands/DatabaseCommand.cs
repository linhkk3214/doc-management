using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Commands
{
    /// <summary>
    /// Console command để quản lý database
    /// </summary>
    public class DatabaseCommand
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DatabaseCommand> _logger;

        public DatabaseCommand(IServiceProvider serviceProvider, ILogger<DatabaseCommand> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        /// <summary>
        /// Khởi tạo database với các tùy chọn
        /// </summary>
        public async Task InitializeAsync(DatabaseInitOptions options)
        {
            try
            {
                _logger.LogInformation("Bắt đầu khởi tạo database...");

                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AdminDbContext>();

                // Kiểm tra kết nối
                _logger.LogInformation("Kiểm tra kết nối database...");
                await context.Database.CanConnectAsync();
                _logger.LogInformation("Kết nối database thành công!");

                // Tạo lại database nếu được yêu cầu
                if (options.RecreateDatabase)
                {
                    _logger.LogWarning("Xóa database hiện tại...");
                    await context.Database.EnsureDeletedAsync();
                }

                // Tạo database
                if (options.UseEnsureCreated)
                {
                    _logger.LogInformation("Tạo database bằng EnsureCreated...");
                    await context.Database.EnsureCreatedAsync();
                }
                else
                {
                    _logger.LogInformation("Áp dụng migrations...");
                    await context.Database.MigrateAsync();
                }

                // Seed dữ liệu
                if (options.SeedData)
                {
                    await SeedDataAsync(context);
                }

                _logger.LogInformation("Khởi tạo database hoàn thành!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi khởi tạo database: {Message}", ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Seed dữ liệu mẫu
        /// </summary>
        private async Task SeedDataAsync(AdminDbContext context)
        {
            _logger.LogInformation("Bắt đầu seed dữ liệu...");

            // Kiểm tra xem đã có dữ liệu chưa
            if (await context.Cities.AnyAsync())
            {
                _logger.LogInformation("Database đã có dữ liệu, bỏ qua seed.");
                return;
            }

            // Seed Cities
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
            _logger.LogInformation("Đã seed {Count} cities", cities.Length);

            // Seed Districts
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
                },
                new Domain.Entities.District
                {
                    Id = Guid.NewGuid(),
                    Name = "Quận 3",
                    Code = "Q3",
                    IdCity = cityHCM,
                    Population = 250000,
                    HappyRate = 87.3m,
                    Deleted = false,
                    Created = DateTime.UtcNow
                },
                new Domain.Entities.District
                {
                    Id = Guid.NewGuid(),
                    Name = "Hải Châu",
                    Code = "HC",
                    IdCity = cityDaNang,
                    Population = 180000,
                    HappyRate = 89.1m,
                    Deleted = false,
                    Created = DateTime.UtcNow
                }
            };

            context.Districts.AddRange(districts);
            await context.SaveChangesAsync();
            _logger.LogInformation("Đã seed {Count} districts", districts.Length);

            _logger.LogInformation("Seed dữ liệu hoàn thành!");
        }

        /// <summary>
        /// Tạo console application để chạy database commands
        /// </summary>
        public static async Task RunConsoleApp(string[] args)
        {
            // Tạo configuration
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false)
                .AddJsonFile("appsettings.Development.json", optional: true)
                .Build();

            // Tạo service collection
            var services = new ServiceCollection();
            services.AddLogging(builder => builder.AddConsole());
            services.AddInfrastructure(configuration);

            var serviceProvider = services.BuildServiceProvider();
            var logger = serviceProvider.GetRequiredService<ILogger<DatabaseCommand>>();
            var command = new DatabaseCommand(serviceProvider, logger);

            // Parse arguments
            var options = ParseArguments(args);

            // Chạy command
            await command.InitializeAsync(options);
        }

        private static DatabaseInitOptions ParseArguments(string[] args)
        {
            var options = new DatabaseInitOptions();

            for (int i = 0; i < args.Length; i++)
            {
                switch (args[i].ToLower())
                {
                    case "--recreate":
                    case "-r":
                        options.RecreateDatabase = true;
                        break;
                    case "--no-seed":
                        options.SeedData = false;
                        break;
                    case "--ensure-created":
                        options.UseEnsureCreated = true;
                        break;
                }
            }

            return options;
        }
    }

    public class DatabaseInitOptions
    {
        public bool RecreateDatabase { get; set; } = false;
        public bool SeedData { get; set; } = true;
        public bool UseEnsureCreated { get; set; } = false;
    }
}
