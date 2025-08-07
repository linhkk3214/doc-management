using Shared.Classes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.Interfaces
{
  public interface IBaseService<T> : IBaseService where T : BaseEntity
  {
    Task<IMethodResult<T?>> Add(T entity);
    Task<IMethodResult<T?>> Update(T entity);
    Task<IMethodResult<T?>> Delete(T entity);
    Task<IMethodResult<List<T>>> GetData(QueryData? queryData, CancellationToken? cancellationToken);
    Task<IMethodResult<List<object>>> GetDataDynamic(QueryData? queryData, CancellationToken? cancellationToken);
    Task<IMethodResult<T?>> GetById(Guid id, CancellationToken? cancellationToken);
  }

  public interface IBaseService
  {
  }
}
