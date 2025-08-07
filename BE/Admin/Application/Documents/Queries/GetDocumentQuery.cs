using MediatR;
using Shared.Classes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Documents.Queries
{
  internal class GetDocumentQuery : IRequest<DataGrid<object>>
  {
    internal QueryData Data;

    public GetDocumentQuery(QueryData queryData)
    {
      this.Data = queryData;
    }
  }
}
