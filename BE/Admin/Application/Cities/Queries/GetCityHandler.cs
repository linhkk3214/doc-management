using Domain.Entities;
using Domain.Interfaces;
using MediatR;
using Shared.Classes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Cities.Queries
{
  internal class GetCityHandler : IRequestHandler<GetCityQuery, DataGrid<object>>
  {
    private readonly ICitiesRepository _citiesRepository;

    public GetCityHandler(ICitiesRepository citiesRepository)
    {
      this._citiesRepository = citiesRepository;
    }
    public async Task<DataGrid<object>> Handle(GetCityQuery request, CancellationToken cancellationToken)
    {
      return await _citiesRepository.GetDataDynamic(request.Data, cancellationToken);
    }
  }
}
