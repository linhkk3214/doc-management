using MediatR;
using Shared.Classes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.DmPhong.Queries
{
    internal class GetDmPhongQuery : IRequest<DataGrid<object>>
    {
        private readonly QueryData _queryData;

        internal QueryData Data;

        public GetDmPhongQuery(QueryData queryData)
        {
            this._queryData = queryData;
            this.Data = queryData;
        }
    }
}
