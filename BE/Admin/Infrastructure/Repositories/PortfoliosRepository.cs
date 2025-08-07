using Shared.Classes;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using Shared.Extensions;
using Domain.Interfaces;

namespace Infrastructure.Repositories
{
  public class PortfoliosRepository : AdminBaseReposity<Portfolio>, IPortfoliosRepository
  {
    public PortfoliosRepository(IServiceProvider serviceProvider) : base(serviceProvider)
    {
    }
  }
}
