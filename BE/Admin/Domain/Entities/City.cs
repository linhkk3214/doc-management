using System;
using System.Collections.Generic;
using Shared.Classes;

namespace Domain.Entities;

public partial class City : BaseEntity
{
  public bool Capital { get; set; }

  public int Type { get; set; }

  public string Name { get; set; }

  public string Code { get; set; }

  public virtual ICollection<District> Districts { get; set; } = new List<District>();
}
