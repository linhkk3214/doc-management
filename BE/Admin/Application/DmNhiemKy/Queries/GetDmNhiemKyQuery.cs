using MediatR;
using Shared.Classes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.DmNhiemKy.Queries
{
    internal class GetDmNhiemKyQuery : IRequest<DataGrid<object>>
    {
        private readonly QueryData _queryData;

        internal QueryData Data;

        public GetDmNhiemKyQuery(QueryData queryData)
        {
            this._queryData = queryData;
            this.Data = queryData;
        }
    }
}
