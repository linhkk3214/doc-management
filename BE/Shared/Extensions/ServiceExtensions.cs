using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Shared.Extensions
{
  public static class ServiceExtensions
  {
    public static void RegisterServicesFromNamespace(this IServiceCollection services, Assembly assembly, string @namespace, ServiceLifetime lifetime = ServiceLifetime.Scoped)
    {
      var types = assembly.GetTypes()
          .Where(type => type.IsClass
                 && !type.IsAbstract
                 && type.GetCustomAttribute<IgnoreRegisterAttribute>() == null
                 && type.Namespace == @namespace)
          .ToList();

      foreach (var implementationType in types)
      {
        var interfaceType = implementationType.GetInterfaces()
            .FirstOrDefault(i => i.Name == $"I{implementationType.Name}");

        if (interfaceType != null)
        {
          switch (lifetime)
          {
            case ServiceLifetime.Scoped:
              services.AddScoped(interfaceType, implementationType);
              break;
            case ServiceLifetime.Singleton:
              services.AddSingleton(interfaceType, implementationType);
              break;
            case ServiceLifetime.Transient:
              services.AddTransient(interfaceType, implementationType);
              break;
          }
        }
      }
    }
  }
}
