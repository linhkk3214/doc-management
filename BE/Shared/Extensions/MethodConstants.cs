using Azure;
using Shared.Classes;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Shared.Extensions
{
  internal static class MethodConstants
  {
    public const string Count = "Count";
    public const string Length = "Length";
    public const string Item = "Item";

    public const string OrderBy = "OrderBy";
    public const string OrderByDescending = "OrderByDescending";
    public const string ThenBy = "ThenBy";
    public const string ThenByDescending = "ThenByDescending";
    public const string Select = "Select";
    public const string Where = "Where";
    public const string AsEnumerable = "AsEnumerable";
    public const string First = "First";
    public const string Like = "Like";
    public const string Any = "Any";

    public const string Include = "Include";
    public const string ThenInclude = "ThenInclude";

    public const string Contains = "Contains";
    public const string StartsWith = "StartsWith";
    public const string EndsWith = "EndsWith";

    public new const string Equals = "Equals";

    public static readonly Type QueryableType = typeof(Queryable);
    public static readonly Type EnumerableType = typeof(Enumerable);
    public static readonly Type StringType = typeof(string);

    public static readonly TypeInfo QueryableTypeInfo = QueryableType.GetTypeInfo();
    public static readonly TypeInfo EnumerableTypeInfo = EnumerableType.GetTypeInfo();
    public static readonly TypeInfo StringTypeInfo = StringType.GetTypeInfo();

    #region EntityFramework method

    private static MethodInfo? GetEntityFrameworkMethod(MethodParams methodParams)
    {
      switch (methodParams.MethodName)
      {
        case Include:
          return IncludeMethodInfo;
        case ThenInclude:
          if (methodParams.AddtionalInfo is null || methodParams.AddtionalInfo.AfterEnum is null)
            throw new ArgumentNullException("AfterEnum", "ThenInclude needs the param AfterEnum to know when using the method ThenInclude");
          return methodParams.AddtionalInfo.AfterEnum switch
          {
            true => ThenIncludeAfterEnumerableMethodInfo,
            _ => ThenIncludeAfterReferenceMethodInfo
          };
        case Like:
          return DbFunctionLike;
        default:
          return null;
      }
    }

    private static readonly MethodInfo IncludeMethodInfo
        = typeof(EntityFrameworkQueryableExtensions)
          .GetTypeInfo()
          .GetDeclaredMethods(Include)
          .Single(mi => mi.GetGenericArguments().Length == 2 && mi.GetParameters().Any(pi => pi.Name == "navigationPropertyPath" && pi.ParameterType != StringTypeInfo));

    private static readonly MethodInfo ThenIncludeAfterReferenceMethodInfo
        = typeof(EntityFrameworkQueryableExtensions)
          .GetTypeInfo()
          .GetDeclaredMethods("ThenInclude")
          .Single(mi => mi.GetGenericArguments().Length == 3 && mi.GetParameters()[0].ParameterType.GenericTypeArguments[1].IsGenericParameter);

    private static readonly MethodInfo ThenIncludeAfterEnumerableMethodInfo
        = typeof(EntityFrameworkQueryableExtensions)
          .GetTypeInfo()
          .GetDeclaredMethods(ThenInclude)
          .Where(mi => mi.GetGenericArguments().Length == 3)
          .Single(mi =>
          {
            var typeInfo = mi.GetParameters()[0].ParameterType.GenericTypeArguments[1];
            return typeInfo.IsGenericType && typeInfo.GetGenericTypeDefinition() == typeof(IEnumerable<>);
          });

    public static readonly MethodInfo DbFunctionLike = Array.Find(typeof(DbFunctionsExtensions).GetMethods(BindingFlags.Static | BindingFlags.Public), x => x.Name == Like);

    #endregion

    #region Queryable method

    /// <summary>
    /// Get method to filter queryable data based on filter operator
    /// </summary>
    /// <returns></returns>
    private static MethodInfo? GetQueryableMethod(string methodName, int numberOfParams)
    {
      return methodName switch
      {
        Count => QueryableTypeInfo.GetDeclaredMethods(Count).FirstOrDefault(x => x.IsGenericMethod && x.GetParameters().Length == numberOfParams),
        Where => QueryableTypeInfo.GetDeclaredMethods(Where).FirstOrDefault(x => x.IsGenericMethod && x.GetParameters().Length == numberOfParams),
        Contains => QueryableTypeInfo.GetDeclaredMethods(Contains).FirstOrDefault(x => x.IsGenericMethod && x.GetParameters().Length == numberOfParams),
        Select => QueryableTypeInfo.GetDeclaredMethods(Select).FirstOrDefault(x => x.IsGenericMethod && x.GetGenericArguments().Length == numberOfParams),
        OrderBy => QueryableTypeInfo.GetDeclaredMethods(OrderBy).FirstOrDefault(x => x.IsGenericMethod && x.GetGenericArguments().Length == numberOfParams),
        ThenBy => QueryableTypeInfo.GetDeclaredMethods(ThenBy).FirstOrDefault(x => x.IsGenericMethod && x.GetGenericArguments().Length == numberOfParams),
        OrderByDescending => QueryableTypeInfo.GetDeclaredMethods(OrderByDescending).FirstOrDefault(x => x.IsGenericMethod && x.GetGenericArguments().Length == numberOfParams),
        ThenByDescending => QueryableTypeInfo.GetDeclaredMethods(ThenByDescending).FirstOrDefault(x => x.IsGenericMethod && x.GetGenericArguments().Length == numberOfParams),
        _ => Array.Find(QueryableTypeInfo.GetMethods(), x => x.Name.Equals(methodName, StringComparison.OrdinalIgnoreCase) && x.GetParameters().Length == numberOfParams)
      };
    }

    #endregion

    #region Enumerable method
    /// <summary>
    /// Get method to filter enumerable data based on filter operator
    /// </summary>
    /// <returns></returns>
    internal static MethodInfo GetEnumerableMethod(string methodName, int numberOfParams)
    {
      return methodName switch
      {
        Any => EnumerableTypeInfo.GetDeclaredMethods(Any).FirstOrDefault(x => x.IsGenericMethod && x.GetParameters().Length == numberOfParams),
        First => EnumerableTypeInfo.GetDeclaredMethods(First).FirstOrDefault(x => x.IsGenericMethod && x.GetParameters().Length == numberOfParams),
        Count => EnumerableTypeInfo.GetDeclaredMethods(Count).FirstOrDefault(x => x.IsGenericMethod && x.GetParameters().Length == numberOfParams),
        AsEnumerable => EnumerableTypeInfo.GetDeclaredMethods(AsEnumerable).FirstOrDefault(x => x.IsGenericMethod && x.GetParameters().Length == numberOfParams),
        Where => EnumerableTypeInfo.GetDeclaredMethods(Where).FirstOrDefault(x => x.IsGenericMethod && x.GetParameters().Length == numberOfParams),
        Contains => EnumerableTypeInfo.GetDeclaredMethods(Contains).FirstOrDefault(x => x.IsGenericMethod && x.GetParameters().Length == numberOfParams),
        Select => EnumerableTypeInfo.GetDeclaredMethods(Select).FirstOrDefault(x => x.IsGenericMethod && x.GetParameters().Length == numberOfParams),
        OrderBy => EnumerableTypeInfo.GetDeclaredMethods(OrderBy).FirstOrDefault(x => x.IsGenericMethod && x.GetParameters().Length == numberOfParams),
        ThenBy => EnumerableTypeInfo.GetDeclaredMethods(ThenBy).FirstOrDefault(x => x.IsGenericMethod && x.GetParameters().Length == numberOfParams),
        OrderByDescending => EnumerableTypeInfo.GetDeclaredMethods(OrderByDescending).FirstOrDefault(x => x.IsGenericMethod && x.GetParameters().Length == numberOfParams),
        ThenByDescending => EnumerableTypeInfo.GetDeclaredMethods(ThenByDescending).FirstOrDefault(x => x.IsGenericMethod && x.GetParameters().Length == numberOfParams),
        _ => Array.Find(EnumerableTypeInfo.GetMethods(), x => x.Name.Equals(methodName, StringComparison.OrdinalIgnoreCase) && x.GetParameters().Length == numberOfParams)
      };
    }

    #endregion

    #region String method

    private static MethodInfo GetStringMethod(string methodName, int numberOfParams)
    {
      return methodName switch
      {
        Contains => Array.Find(StringTypeInfo.GetMethods(BindingFlags.Public | BindingFlags.Instance), x => x.Name == Contains && x.GetParameters().Length == numberOfParams),
        StartsWith => Array.Find(StringTypeInfo.GetMethods(BindingFlags.Public | BindingFlags.Instance), x => x.Name == StartsWith && x.GetParameters().Length == numberOfParams),
        EndsWith => Array.Find(StringTypeInfo.GetMethods(BindingFlags.Public | BindingFlags.Instance), x => x.Name == EndsWith && x.GetParameters().Length == numberOfParams),
        Equals => Array.Find(StringTypeInfo.GetMethods(BindingFlags.Public | BindingFlags.Instance), x => x.Name == Equals && x.GetParameters().Length == numberOfParams),
        _ => Array.Find(StringTypeInfo.GetMethods(BindingFlags.Public), x => x.Name == methodName && x.GetParameters().Length == numberOfParams)
      };
    }

    /// <summary>
    /// Get method to filter string data based on filter operator
    /// </summary>
    /// <returns></returns>
    internal static MethodInfo GetStringMethod(FilterOperator filterOperator, int numberOfParams)
    {
      return filterOperator switch
      {
        FilterOperator.Contains or FilterOperator.NotContains => GetStringMethod(Contains, numberOfParams),
        FilterOperator.StartsWith or FilterOperator.NotStartsWith => GetStringMethod(StartsWith, numberOfParams),
        FilterOperator.EndsWith or FilterOperator.NotEndsWith => GetStringMethod(EndsWith, numberOfParams),
        FilterOperator.Equal or FilterOperator.NotEqual => GetStringMethod(Equals, numberOfParams),
        _ => Array.Find(StringTypeInfo.GetMethods(BindingFlags.Public), x => x.Name == Equals && x.GetParameters().Length == numberOfParams),
      };
    }

    #endregion
  }

  internal class MethodParams
  {
    public required string MethodName { get; set; }
    public int NumberOfParams { get; set; }
    /*
     * Addtional info
     * (VD: AfterEnum cho method ThenInclude của EntityFramework)
     */
    public dynamic? AddtionalInfo { get; set; }
  }
}
