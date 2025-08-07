using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Auth.DataAccess
{
  public class AuthDbContextFactory : IDesignTimeDbContextFactory<AuthDbContext>
  {
    public AuthDbContext CreateDbContext(string[] args)
    {
      var builder = new DbContextOptionsBuilder<AuthDbContext>();
      var connectionString = "Data Source=localhost;Initial Catalog=Auth;Integrated Security=True;TrustServerCertificate=True";
      builder.UseSqlServer(connectionString);
      return new AuthDbContext(builder.Options);
    }
  }
}
