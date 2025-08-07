using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.Classes
{
  public class BaseEntity
  {
    public Guid Id { get; set; }
    public DateTime Created { get; set; }
    public DateTime? Updated { get; set; }
    public bool Deleted { get; set; }
  }
}
