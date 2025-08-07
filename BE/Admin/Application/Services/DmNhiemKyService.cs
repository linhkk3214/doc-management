using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using Shared.Classes;
using Shared.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class DmNhiemKyService : BaseService<IDmNhiemKyRepository, Domain.Entities.DmNhiemKy>, IDmNhiemKyService
    {
        public DmNhiemKyService(IServiceProvider serviceProvider) : base(serviceProvider) { }
    }
}
