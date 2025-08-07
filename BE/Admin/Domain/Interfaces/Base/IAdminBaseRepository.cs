using Shared.Classes;
using Shared.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
  public interface IAdminBaseRepository<T> : IBaseRepository<T> where T : BaseEntity
  {
  }
}
