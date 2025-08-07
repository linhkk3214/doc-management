using Domain.Entities;
using Domain.Interfaces;
using MediatR;
using Shared.Classes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Portfolios.Queries
{
  internal class GetPortfolioHandler : IRequestHandler<GetPortfolioQuery, DataGrid<object>>
  {
    private readonly IPortfoliosRepository _portfoliosRepository;

    public GetPortfolioHandler(IPortfoliosRepository portfoliosRepository)
    {
      this._portfoliosRepository = portfoliosRepository;
    }

    public async Task<DataGrid<object>> Handle(GetPortfolioQuery request, CancellationToken cancellationToken)
    {
      return await _portfoliosRepository.GetDataDynamic(request.Data, cancellationToken);
    }
  }
}
