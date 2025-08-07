using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure
{
  public class GraphQLMutation
  {
    private readonly AdminDbContext _context;
    public GraphQLMutation(AdminDbContext context)
    {
      _context = context;
    }

    public bool ChangeFirstCity(string name)
    {
      GraphQLQuery._cities[0].Name = name;
      return true;
    }
  }
}
