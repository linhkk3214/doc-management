using Infrastructure.Repositories;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Shared.Extensions;
using Microsoft.Extensions.Logging;

namespace Infrastructure
{
  public static class InfrastructureExtensions
  {
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
      services.AddDbContext<AdminDbContext>(opt =>
      {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        var databaseProvider = configuration.GetValue<string>("DatabaseProvider") ?? "SqlServer";

        switch (databaseProvider.ToLower())
        {
          case "postgresql":
          case "postgres":
            opt.UseNpgsql(connectionString);
            break;
          case "sqlserver":
          default:
            opt.UseSqlServer(connectionString);
            break;
        }

#if DEBUG
        opt.LogTo(Console.WriteLine, LogLevel.Information);
#endif
      });
      services.AddGraphQLServer()
        .ModifyOptions(opt =>
        {
          opt.EnableDefer = true;
          opt.EnableStream = true;
        })
        .AddQueryType<GraphQLQuery>()
        .AddMutationType<GraphQLMutation>()
        ;
      services.AddGraphQL();
      return services;
    }

    public static IServiceCollection RegisterRepositories(this IServiceCollection services)
    {
      //services.AddScoped<ICitiesRepository, CitiesRepository>();
      services.RegisterServicesFromNamespace(Assembly.GetExecutingAssembly(), "Infrastructure.Repositories");
      return services;
    }

    /// <summary>
    /// Adds PostgreSQL-specific infrastructure services
    /// </summary>
    public static IServiceCollection AddPostgreSQLInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
      services.AddDbContext<AdminDbContext>(opt =>
      {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        opt.UseNpgsql(connectionString);

#if DEBUG
        opt.LogTo(Console.WriteLine, LogLevel.Information);
#endif
      });

      services.AddGraphQLServer()
        .ModifyOptions(opt =>
        {
          opt.EnableDefer = true;
          opt.EnableStream = true;
        })
        .AddQueryType<GraphQLQuery>()
        .AddMutationType<GraphQLMutation>();

      services.AddGraphQL();
      return services;
    }

    /// <summary>
    /// Adds SQL Server-specific infrastructure services
    /// </summary>
    public static IServiceCollection AddSqlServerInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
      services.AddDbContext<AdminDbContext>(opt =>
      {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        opt.UseSqlServer(connectionString);

#if DEBUG
        opt.LogTo(Console.WriteLine, LogLevel.Information);
#endif
      });

      services.AddGraphQLServer()
        .ModifyOptions(opt =>
        {
          opt.EnableDefer = true;
          opt.EnableStream = true;
        })
        .AddQueryType<GraphQLQuery>()
        .AddMutationType<GraphQLMutation>();

      services.AddGraphQL();
      return services;
    }
  }
}
