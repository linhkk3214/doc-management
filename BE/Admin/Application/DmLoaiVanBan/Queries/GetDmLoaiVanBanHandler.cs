using Domain.Entities;
using Domain.Interfaces;
using MediatR;
using Shared.Classes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DmLoaiVanBan.Queries
{
    internal class GetDmLoaiVanBanHandler : IRequestHandler<GetDmLoaiVanBanQuery, DataGrid<object>>
    {
        private readonly IDmLoaiVanBanRepository _dmLoaiVanBanRepository;

        public GetDmLoaiVanBanHandler(IDmLoaiVanBanRepository dmLoaiVanBanRepository)
        {
            this._dmLoaiVanBanRepository = dmLoaiVanBanRepository;
        }
        public async Task<DataGrid<object>> Handle(GetDmLoaiVanBanQuery request, CancellationToken cancellationToken)
        {
            return await _dmLoaiVanBanRepository.GetDataDynamic(request.Data, cancellationToken);
        }
    }
}
