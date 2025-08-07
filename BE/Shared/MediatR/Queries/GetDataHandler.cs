using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Shared.Classes;
using Shared.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.MediatR.Queries
{
  internal class GetDataHandler<T, T2> : IRequestHandler<GetDataQuery<T, T2>, DataGrid<object>> where T : IBaseRepository<T2> where T2 : BaseEntity
  {
    private readonly T _repository;

    public GetDataHandler(IServiceProvider serviceProvider)
    {
      this._repository = serviceProvider.GetRequiredService<T>();
    }
    public async Task<DataGrid<object>> Handle(GetDataQuery<T, T2> request, CancellationToken cancellationToken)
    {
      return await _repository.GetDataDynamic(request.Data, cancellationToken);
    }
  }
}
