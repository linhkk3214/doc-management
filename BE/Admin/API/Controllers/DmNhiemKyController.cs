using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Classes;
using System.Text.Json;

namespace Admin.Controllers
{
    public class DmNhiemKyController : BaseController<IDmNhiemKyService, Domain.Entities.DmNhiemKy>
    {
        public DmNhiemKyController(IServiceProvider serviceProvider, IMediator mediator) : base(serviceProvider, mediator)
        {

        }
    }
}
