using Domain.Entities;
using Domain.Interfaces;
using MediatR;
using Shared.Classes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DmPhong.Queries
{
    internal class GetDmPhongHandler : IRequestHandler<GetDmPhongQuery, DataGrid<object>>
    {
        private readonly IDmPhongRepository _dmPhongRepository;

        public GetDmPhongHandler(IDmPhongRepository dmPhongRepository)
        {
            this._dmPhongRepository = dmPhongRepository;
        }
        public async Task<DataGrid<object>> Handle(GetDmPhongQuery request, CancellationToken cancellationToken)
        {
            return await _dmPhongRepository.GetDataDynamic(request.Data, cancellationToken);
        }
    }
}
