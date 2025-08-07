using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Shared;
using Shared.Interfaces;
using Shared.Extensions;
using Microsoft.Extensions.DependencyInjection;

namespace Shared.Classes
{
  public abstract class BaseRepository<T, CT> : IBaseRepository<T> where T : BaseEntity where CT : DbContext
  {
    protected readonly CT Context;

    public BaseRepository(IServiceProvider serviceProvider)
    {
      Context = serviceProvider.GetRequiredService<CT>();
    }

    public async Task<T> Add(T entity)
    {
      entity.Created = DateTime.UtcNow;
      Context.Add(entity);
      await Context.SaveChangesAsync();
      return entity;
    }

    public async Task<T> Update(T entity)
    {
      entity.Updated = DateTime.UtcNow;
      Context.Update(entity);
      await Context.SaveChangesAsync();
      return entity;
    }

    public async Task Delete(T entity)
    {
      Context.Update(entity);
      await Context.SaveChangesAsync();
    }

    public async Task<T?> GetById(Guid id, CancellationToken? cancellationToken)
    {
      T item = await Context.Set<T>().FirstOrDefaultAsync(x => x.Id == id, cancellationToken ?? default);
      return item;
    }

    public async Task<DataGrid<T>> GetData(QueryData? queryData, CancellationToken? cancellationToken)
    {
      DataGrid<T> result = await Context.Set<T>().AsQueryable().GetData(queryData);
      return result;
    }

    public async Task<DataGrid<object>> GetDataDynamic(QueryData? queryData, CancellationToken? cancellationToken)
    {
      DataGrid<object> result = await Context.Set<T>().AsQueryable().GetDataDynamic(queryData);
      return result;
    }
  }
}
