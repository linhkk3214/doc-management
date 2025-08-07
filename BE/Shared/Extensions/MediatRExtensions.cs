using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.Extensions
{
  public static class MediatRExtensions
  {
    public static void AddMediatRBase(this IServiceCollection services)
    {
      services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Shared.MediatR.Queries.GetDataHandler<,>).Assembly));
    }
  }
}
