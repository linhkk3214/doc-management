using MediatR;
using Shared.Classes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Portfolios.Queries
{
  internal class GetPortfolioQuery : IRequest<DataGrid<object>>
  {
    internal QueryData Data;

    public GetPortfolioQuery(QueryData queryData)
    {
      this.Data = queryData;
    }
  }
}
