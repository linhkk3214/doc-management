using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.Extensions
{
  internal static class TypeExtensions
  {
    internal static bool IsNullableType(this Type type)
    {
      return type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Nullable<>);
    }
  }
}
