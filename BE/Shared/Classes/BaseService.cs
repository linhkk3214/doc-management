using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Shared.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.Classes
{
  public class BaseService<T, T2> : IBaseService<T2> where T : IBaseRepository<T2> where T2 : BaseEntity
  {
    private readonly T _repository;

    private protected T Repository => _repository;

    public BaseService(IServiceProvider serviceProvider)
    {
      _repository = serviceProvider.GetRequiredService<T>();
    }

    public async Task<IMethodResult<T2?>> Add(T2 entity)
    {
      T2 item = await _repository.Add(entity);
      return MethodResult<T2?>.ResultWithData(item);
    }

    public async Task<IMethodResult<T2?>> Update(T2 entity)
    {
      T2 item = await _repository.Update(entity);
      return MethodResult<T2?>.ResultWithData(item);
    }

    public async Task<IMethodResult<T2?>> Delete(T2 entity)
    {
      await _repository.Delete(entity);
      return MethodResult<T2?>.ResultWithData(null);
    }

    public async Task<IMethodResult<T2?>> GetById(Guid id, CancellationToken? cancellationToken)
    {
      T2 item = await _repository.GetById(id, cancellationToken);
      return MethodResult<T2?>.ResultWithData(item);
    }

    public async Task<IMethodResult<List<T2>>> GetData(QueryData? queryData, CancellationToken? cancellationToken)
    {
      DataGrid<T2> result = await _repository.GetData(queryData, cancellationToken);
      return MethodResult<List<T2>>.ResultWithData(result.Data, result.Total);
    }

    public async Task<IMethodResult<List<object>>> GetDataDynamic(QueryData? queryData, CancellationToken? cancellationToken)
    {
      DataGrid<object> result = await _repository.GetDataDynamic(queryData, cancellationToken);
      return MethodResult<List<object>>.ResultWithData(result.Data, result.Total);
    }
  }
}
