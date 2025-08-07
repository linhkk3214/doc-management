using MediatR;
using Shared.Classes;
using Shared.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.MediatR.Queries
{
  public class GetDataQuery<T, T2> : IRequest<DataGrid<object>> where T : IBaseRepository<T2> where T2 : BaseEntity
  {
    private readonly QueryData _queryData;

    internal QueryData Data;

    public GetDataQuery(QueryData queryData)
    {
      this._queryData = queryData;
    }
  }
}
