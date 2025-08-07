using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure
{
  public static class ServiceFactory
  {
    private static IServiceProvider _serviceProvider;

    public static void SetServiceProvider(IServiceProvider serviceProvider)
    {
      _serviceProvider = serviceProvider;
    }

    public static T GetService<T>()
    {
      return _serviceProvider.GetRequiredService<T>();
    }

    public static T GetScopedService<T>()
    {
      using (var scope = _serviceProvider.CreateScope())
      {
        return scope.ServiceProvider.GetRequiredService<T>();
      }
    }
  }
}
