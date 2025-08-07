using System;
using System.Collections.Generic;
using Shared.Classes;

namespace Domain.Entities;

public partial class District : BaseEntity
{
  public Guid IdCity { get; set; }

  public string Name { get; set; }

  public string Code { get; set; }

  public decimal? Population { get; set; }

  public decimal? HappyRate { get; set; }

  public virtual City IdCityNavigation { get; set; }
}
