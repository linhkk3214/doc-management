using Auth.DataAccess.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Auth.DataAccess
{
  public class AuthDbContext : IdentityDbContext<Users>
  {
    public AuthDbContext(DbContextOptions<AuthDbContext> options)
        : base(options)
    {
    }
  }
}
