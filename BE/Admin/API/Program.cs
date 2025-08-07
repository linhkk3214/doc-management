using API.Test;
using Application.Extensions;
using Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Shared;

var builder = WebApplication.CreateBuilder(args);
builder.ConfigureBase();
builder.Services.AddInfrastructure(builder.Configuration)
                .AddAdminMediatR()
                .RegisterServices()
                .RegisterRepositories()
                ;

var app = builder.Build();

// Khởi tạo database khi ứng dụng khởi động
if (app.Environment.IsDevelopment())
{
    // Trong môi trường development, có thể tự động khởi tạo database
    await app.Services.InitializeDatabaseAsync();
    await app.Services.SeedDataAsync();
}

app.ConfigureBase();
app.Run();
