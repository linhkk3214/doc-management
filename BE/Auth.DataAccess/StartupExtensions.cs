using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Auth.DataAccess.Models;

namespace Auth.DataAccess
{
  public static class StartupExtensions
  {
    public static IServiceCollection AddAuthDbContext(this IServiceCollection services, ConfigurationManager configuration)
    {
      services.AddDbContext<AuthDbContext>(options =>
        options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

      services.AddIdentity<Users, IdentityRole>()
          .AddEntityFrameworkStores<AuthDbContext>()
          .AddDefaultTokenProviders();
      return services;
    }
  }
}
