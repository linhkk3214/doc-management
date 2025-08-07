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
  public class CitiesService : BaseService<ICitiesRepository, City>, ICitiesService
  {
    public CitiesService(IServiceProvider serviceProvider) : base(serviceProvider) { }
  }
}
