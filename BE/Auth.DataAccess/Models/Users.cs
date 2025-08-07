using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Auth.DataAccess.Models
{
  public class Users : IdentityUser
  {
    [NotMapped]
    public string Password { get; set; }
  }
}
