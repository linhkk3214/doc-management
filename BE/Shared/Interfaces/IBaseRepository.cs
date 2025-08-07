using Shared.Classes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.Interfaces
{
  public interface IBaseRepository<T> : IBaseRepository where T : BaseEntity
  {
    Task<T> Add(T entity);
    Task<T> Update(T entity);
    Task Delete(T entity);
    Task<DataGrid<T>> GetData(QueryData? queryData, CancellationToken? cancellationToken);
    Task<DataGrid<object>> GetDataDynamic(QueryData? queryData, CancellationToken? cancellationToken);
    Task<T?> GetById(Guid id, CancellationToken? cancellationToken);
  }

  public interface IBaseRepository
  {

  }
}
