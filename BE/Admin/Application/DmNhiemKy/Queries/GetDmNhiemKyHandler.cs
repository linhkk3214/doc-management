using Domain.Entities;
using Domain.Interfaces;
using MediatR;
using Shared.Classes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DmNhiemKy.Queries
{
    internal class GetDmNhiemKyHandler : IRequestHandler<GetDmNhiemKyQuery, DataGrid<object>>
    {
        private readonly IDmNhiemKyRepository _dmNhiemKyRepository;

        public GetDmNhiemKyHandler(IDmNhiemKyRepository dmNhiemKyRepository)
        {
            this._dmNhiemKyRepository = dmNhiemKyRepository;
        }
        public async Task<DataGrid<object>> Handle(GetDmNhiemKyQuery request, CancellationToken cancellationToken)
        {
            return await _dmNhiemKyRepository.GetDataDynamic(request.Data, cancellationToken);
        }
    }
}
