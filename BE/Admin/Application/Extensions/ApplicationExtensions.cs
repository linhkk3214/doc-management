using Application.Interfaces;
using Application.Services;
using Application.Excel.Services;
using Microsoft.Extensions.DependencyInjection;
using Shared.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Application.Extensions
{
  public static class ApplicationExtensions
  {
    public static IServiceCollection AddAdminMediatR(this IServiceCollection services)
    {
      services.AddMediatRBase();
      return services;
    }

    public static IServiceCollection RegisterServices(this IServiceCollection services)
    {
      //services.AddScoped<ICitiesService, CitiesService>();
      services.RegisterServicesFromNamespace(Assembly.GetExecutingAssembly(), "Application.Services");
      
      // Register Excel Import Service
      services.AddScoped<IExcelImportService, ExcelImportService>();
      
      return services;
    }
  }
}
