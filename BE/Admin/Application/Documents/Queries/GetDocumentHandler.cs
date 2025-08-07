using Domain.Entities;
using Domain.Interfaces;
using MediatR;
using Shared.Classes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Documents.Queries
{
  internal class GetDocumentHandler : IRequestHandler<GetDocumentQuery, DataGrid<object>>
  {
    private readonly IDocumentsRepository _documentsRepository;

    public GetDocumentHandler(IDocumentsRepository documentsRepository)
    {
      this._documentsRepository = documentsRepository;
    }

    public async Task<DataGrid<object>> Handle(GetDocumentQuery request, CancellationToken cancellationToken)
    {
      return await _documentsRepository.GetDataDynamic(request.Data, cancellationToken);
    }
  }
}
