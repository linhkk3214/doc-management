using Microsoft.EntityFrameworkCore;
using Shared.Classes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Interfaces;

namespace Infrastructure.Repositories
{
  public abstract class AdminBaseReposity<T> : BaseRepository<T, AdminDbContext>, IAdminBaseRepository<T> where T : BaseEntity
  {
    public AdminBaseReposity(IServiceProvider serviceProvider) : base(serviceProvider) { }
  }
}
