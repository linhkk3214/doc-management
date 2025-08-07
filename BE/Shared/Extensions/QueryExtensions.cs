using Shared.Classes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection.Emit;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics.Metrics;
using Azure;
using Microsoft.IdentityModel.Tokens;
using System.ComponentModel;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using System.Reflection.PortableExecutable;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json.Linq;
using Microsoft.Identity.Client;

namespace Shared.Extensions
{
  public static class QueryExtensions
  {
    public static async Task<DataGrid<T>> GetData<T>(this IQueryable<T> queryable, QueryData queryData)
    {
      queryData.Filters?.Clean();
      queryable = queryable.Filter(queryData.Filters);
      DataGrid<T> result = new DataGrid<T>()
      {
        Data = await queryable.GetPage(queryData),
        Total = await queryable.CountAsync()
      };

      return result;
    }

    public static DataGrid<T> GetDataSync<T>(this IQueryable<T> queryable, QueryData queryData)
    {
      queryData.Filters?.Clean();
      queryable = queryable.Filter(queryData.Filters);
      DataGrid<T> result = new DataGrid<T>()
      {
        Data = queryable.GetPageSync(queryData),
        Total = queryable.Count()
      };

      return result;
    }

    public static async Task<DataGrid<object>> GetDataDynamic<T>(this IQueryable<T> queryable, QueryData queryData)
    {
      queryData.Filters?.Clean();
      queryable = queryable.Filter(queryData.Filters);
      DataGrid<object> result = new DataGrid<object>()
      {
        Data = await queryable.GetPageDynamic(queryData),
        Total = await queryable.CountAsync()
      };

      return result;
    }

    public static DataGrid<object> GetDataDynamicSync<T>(this IQueryable<T> queryable, QueryData queryData)
    {
      queryData.Filters?.Clean();
      queryable = queryable.Filter(queryData.Filters);
      DataGrid<object> result = new DataGrid<object>()
      {
        Data = queryable.GetPageDynamicSync(queryData),
        Total = queryable.Count()
      };

      return result;
    }

    public static IQueryable<T> Filter<T>(this IQueryable<T> queryable, List<Filter>? filters)
    {
      if (filters is { Count: > 0 })
      {
        Type rootType = typeof(T);
        ParameterExpression rootParam = Expression.Parameter(rootType, "o");
        return queryable.Where(filters.ToLambdaExpression<T>());
      }
      return queryable;
    }

    public static IQueryable<T> OrderBy<T>(this IQueryable<T> queryable, List<Sort>? sorts)
    {
      if (sorts is { Count: > 0 })
      {
        Expression expression = queryable.Expression;
        int count = sorts.Count;
        ParameterExpression parameter = Expression.Parameter(typeof(T), "s");
        for (int i = 0; i < count; i++)
        {
          Sort item = sorts[i];
          MemberExpression selector = Expression.PropertyOrField(parameter, item.Field);
          string method = item.Dir == Direction.Desc
                           ? (i == 0 ? MethodConstants.OrderByDescending : MethodConstants.ThenByDescending)
                           : (i == 0 ? MethodConstants.OrderBy : MethodConstants.ThenBy);
          expression = Expression.Call(typeof(Queryable), method,
                                       new[] { queryable.ElementType, selector.Type },
                                       expression, Expression.Quote(Expression.Lambda(selector, parameter)));
        }

        return queryable.Provider.CreateQuery<T>(expression);
      }
      return queryable;
    }

    /// <summary>
    ///     Convert filters to LambdaExpression
    /// </summary>
    /// <param name="filters">filters</param>
    /// <param name="logic">Logic để gộp các điều kiện</param>
    /// <returns></returns>
    private static LambdaExpression ToLambdaExpression(this List<Filter> filters, ParameterExpression parameterExp, Logic logic = Logic.And)
    {
      return Expression.Lambda(ConvertToExpression(filters, parameterExp, logic), parameterExp);
    }

    /// <summary>
    ///     Biến đổi từ list filter sang một Lambda Expression dạng Func(T) => bool
    /// </summary>
    /// <param name="filters">List filters</param>
    /// <param name="logic">Logic để gộp các điều kiện</param>
    /// <typeparam name="T"></typeparam>
    /// <returns></returns>
    public static Expression<Func<T, bool>> ToLambdaExpression<T>(this List<Filter> filters, Logic logic = Logic.And)
    {
      return (Expression<Func<T, bool>>)filters.ToLambdaExpression(Expression.Parameter(typeof(T), "x"), logic);
    }

    /// <summary>
    ///     Biến đổi từ list filter sang list expression
    /// </summary>
    /// <param name="filters">List filters</param>
    /// <param name="root">Nút gốc của Expression tree để query biết được nên đi từ đâu</param>
    /// <returns></returns>
    private static Expression ConvertToExpression(List<Filter> filters, Expression root, Logic logic)
    {
      if (filters.Count == 0) return Expression.Empty();
      List<Expression> lstExp = new List<Expression>();
      foreach (Filter filter in filters)
      {
        if (filter.Logic.HasValue && filter.Operator != FilterOperator.RelationalData)
        {
          Expression subExpression = ConvertToExpression(filter.Filters, root, filter.Logic.Value);
          lstExp.Add(subExpression);
          continue;
        }

        MemberExpression fieldExp = Expression.PropertyOrField(root, filter.Field);
        if (filter.Operator is FilterOperator.IsNull or FilterOperator.IsNotNull)
        {
          bool negate = IsNegative(filter.Operator);
          lstExp.Add(NullCompare(fieldExp, !negate));
          continue;
        }

        Type fieldType = fieldExp.Type;
        switch (filter.Operator)
        {
          case FilterOperator.RelationalData:
            lstExp.Add(ToRelationalDataFilter(filter, fieldExp));
            continue;
          // Trường hợp filter theo giá trị có thuộc một mảng
          case FilterOperator.In or FilterOperator.NotIn:
            lstExp.Add(ToCompareCollectionExp(filter, fieldExp));
            continue;
        }

        // Trường hợp trường của model là dạng dữ liệu string
        if (fieldType == typeof(string))
        {
          lstExp.Add(ToCompareStringExp(filter, fieldExp));
          continue;
        }

        // Trường hợp trường model là loại dữ liệu primtive (int, float ...)
        lstExp.Add(ToGenericCompareExp(filter, fieldExp));
      }

      return lstExp.Aggregate(logic == Logic.And ? Expression.AndAlso : Expression.OrElse);
    }

    /// <summary>
    ///     Convert filter sang Expression để filter giá trị theo relational data
    /// </summary>
    /// <param name="filter"></param>
    /// <param name="root"></param>
    /// <returns></returns>
    private static Expression ToRelationalDataFilter(Filter filter, Expression root)
    {
      bool negative = filter.Value == ((int)(FilterOperator.IsFalse)).ToString();
      Expression subExpression;

      if (root.Type.IsCollectionType())
      {
        ParameterExpression fieldExp = Expression.Parameter(root.Type.GetGenericArguments()[0], "y");
        subExpression = filter.Filters.ToLambdaExpression(fieldExp, filter.Logic ?? Logic.And);
        MethodInfo method = MethodConstants.GetEnumerableMethod(MethodConstants.Any, 2)
                                        .MakeGenericMethod(root.Type.GetGenericArguments()[0]);

        MethodCallExpression methodCallExpression = Expression.Call(null, method, new[] { root, subExpression });
        subExpression = methodCallExpression;
        goto DONE;
      }
      subExpression = ConvertToExpression(filter.Filters, root, filter.Logic ?? Logic.And);
    DONE:
      if (negative)
        subExpression = Expression.Not(subExpression);
      return subExpression;
    }

    private static bool IsCollectionType(this Type type)
    {
      if (!type.IsGenericType && !type.IsGenericTypeDefinition)
        return false;

      var interfaces = type.GetInterfaces();

      return interfaces.Any(i =>
          i.IsGenericType &&
          (
              i.GetGenericTypeDefinition() == typeof(ICollection<>) ||
              i.GetGenericTypeDefinition() == typeof(IEnumerable<>) ||
              i.GetGenericTypeDefinition() == typeof(IList<>)
          ));
    }

    /// <summary>
    /// Get Expression for filtering collection.
    /// </summary>
    /// <param name="filter"></param>
    /// <param name="fieldExpression">Expression to get the filter's field</param>
    /// <returns></returns>
    private static Expression ToCompareCollectionExp(Filter filter, MemberExpression fieldExpression)
    {
      if (string.IsNullOrEmpty(filter.Value))
      {
        // Because we can't compare the value, so we will return the FALSE condition.
        return Expression.IsTrue(Expression.Constant(false));
      }
      
      // Determine the correct type for the collection based on the field type
      Type collectionElementType = fieldExpression.Type.IsNullableType() 
        ? Nullable.GetUnderlyingType(fieldExpression.Type) ?? fieldExpression.Type
        : fieldExpression.Type;
      
      Type collectionType = typeof(IList<>).MakeGenericType(collectionElementType);
      
      object? collectionValue = JsonSerializer.Deserialize(filter.Value, collectionType);
      if (collectionValue is null)
      {
        // Because we can't compare the value, so we will return the FALSE condition.
        return Expression.IsTrue(Expression.Constant(false));
      }
      ConstantExpression valueExp = Expression.Constant(collectionValue);

      MethodInfo method = filter.Operator switch
      {
        FilterOperator.In or FilterOperator.NotIn => MethodConstants.GetEnumerableMethod(MethodConstants.Contains, 2),
        _ => throw new TargetParameterCountException("Không tìm được method cho filter")
      };

      if (fieldExpression.Type.IsNullableType())
      {
        fieldExpression = Expression.PropertyOrField(fieldExpression, "Value");
      }

      MethodCallExpression compareExp = Expression.Call(
                                         null,
                                         method.MakeGenericMethod(collectionElementType),
                                         new Expression[] { valueExp, fieldExpression }
                                        );
      bool negate = IsNegative(filter.Operator);
      Expression finalExp = negate ? Expression.Not(compareExp) : compareExp;
      return AddNotNull(fieldExpression, finalExp);
    }

    /// <summary>
    /// Get Expression for filtering primitive value
    /// </summary>
    /// <param name="filter"></param>
    /// <returns></returns>
    private static Expression ToGenericCompareExp(Filter filter, MemberExpression fieldExpression)
    {
      if (fieldExpression.Type.IsNullableType())
      {
        fieldExpression = Expression.PropertyOrField(fieldExpression, "Value");
      }

      object? value = JsonSerializer.Deserialize(filter.Value, fieldExpression.Type);
      ConstantExpression valueExp = Expression.Constant(value);
      Expression compareExp = filter.Operator switch
      {
        FilterOperator.NotEqual => Expression.NotEqual(fieldExpression, valueExp),
        FilterOperator.Equal => Expression.Equal(fieldExpression, valueExp),
        FilterOperator.Greater => Expression.GreaterThan(fieldExpression, valueExp),
        FilterOperator.GreaterOrEqual => Expression.GreaterThanOrEqual(fieldExpression, valueExp),
        FilterOperator.Lower => Expression.LessThan(fieldExpression, valueExp),
        FilterOperator.LowerOrEqual => Expression.LessThanOrEqual(fieldExpression, valueExp),
        FilterOperator.IsTrue => fieldExpression,
        FilterOperator.IsFalse => Expression.Not(fieldExpression),
        _ => Expression.Equal(fieldExpression, valueExp)
      };

      return compareExp;
    }

    /// <summary>
    /// Get Expression for filtering string
    /// </summary>
    /// <param name="filter"></param>
    /// <returns></returns>
    private static Expression ToCompareStringExp(Filter filter, MemberExpression fieldExpression)
    {
      MethodInfo method = MethodConstants.GetStringMethod(filter.Operator, 1);
      if (method is null) return fieldExpression;

      object? value = JsonSerializer.Deserialize(filter.Value, fieldExpression.Type);
      
      Expression compareExp;

      // Check if this is a LIKE operation and we're using PostgreSQL
      if (IsLikeOperation(filter.Operator))
      {
        // Format value with wildcards based on operator
        string formattedValue = FormatValueForLikeOperation(value?.ToString(), filter.Operator);
        ConstantExpression valueExp = Expression.Constant(formattedValue);
        
        // Use EF.Functions.ILike for case-insensitive comparison in PostgreSQL
        var efFunctionsType = typeof(EF);
        var functionsProperty = efFunctionsType.GetProperty("Functions");
        var iLikeMethod = typeof(Microsoft.EntityFrameworkCore.NpgsqlDbFunctionsExtensions).GetMethod("ILike", 
          new[] { typeof(DbFunctions), typeof(string), typeof(string) });
        
        var functionsExp = Expression.Property(null, functionsProperty);
        compareExp = Expression.Call(iLikeMethod, functionsExp, fieldExpression, valueExp);
      }
      else
      {
        ConstantExpression valueExp = Expression.Constant(value);
        compareExp = Expression.Call(fieldExpression, method, valueExp);
      }

      bool negate = IsNegative(filter.Operator);
      Expression finalExp = negate ? Expression.Not(compareExp) : compareExp;
      return AddNotNull(fieldExpression, finalExp);
    }

    private static string FormatValueForLikeOperation(string value, FilterOperator operatorType)
    {
      if (string.IsNullOrEmpty(value))
        return value;
        
      return operatorType switch
      {
        FilterOperator.Contains or FilterOperator.NotContains => $"%{value}%",
        FilterOperator.StartsWith or FilterOperator.NotStartsWith => $"{value}%",
        FilterOperator.EndsWith or FilterOperator.NotEndsWith => $"%{value}",
        _ => value
      };
    }

    private static bool IsLikeOperation(FilterOperator operatorType)
    {
      switch (operatorType)
      {
        case FilterOperator.Contains:
        case FilterOperator.NotContains:
        case FilterOperator.StartsWith:
        case FilterOperator.NotStartsWith:
        case FilterOperator.EndsWith:
        case FilterOperator.NotEndsWith:
          return true;
      }

      return false;
    }

    /// <summary>
    /// Add Expression to check for not NULL
    /// </summary>
    /// <param name="sourceExpression">Expression will be added a not-NULL check condition</param>
    /// <returns></returns>
    private static Expression AddNotNull(MemberExpression fieldExpression, Expression sourceExpression)
    {
      return fieldExpression.Type.IsNullableType() || !fieldExpression.Type.IsValueType
                 ? Expression.AndAlso(NullCompare(fieldExpression, false), sourceExpression)
                 : sourceExpression;
    }

    /// <summary>
    /// Expression to compare with NULL
    /// </summary>
    /// <returns></returns>
    private static Expression NullCompare(MemberExpression fieldExpression, bool isNull)
    {
      return isNull
                 ? Expression.Equal(fieldExpression, Expression.Constant(null))
                 : Expression.NotEqual(fieldExpression, Expression.Constant(null));
    }

    /// <summary>
    /// Check the operation is negative
    /// </summary>
    /// <returns></returns>
    public static bool IsNegative(this FilterOperator filterOperator)
    {
      return filterOperator switch
      {
        FilterOperator.IsNotNull or FilterOperator.NotContains or FilterOperator.NotStartsWith or FilterOperator.NotEndsWith or FilterOperator.NotEqual => true,
        _ => false,
      };
    }

    public static List<T> GetPageSync<T>(this IQueryable<T> query, QueryData queryData)
    {
      return query.ApplyPageAndSortsThenSelect(queryData).ToList();
    }

    public static Task<List<T>> GetPage<T>(this IQueryable<T> query, QueryData queryData)
    {
      return query.ApplyPageAndSortsThenSelect(queryData).ToListAsync();
    }

    public static Task<List<object>> GetPageDynamic<T>(this IQueryable<T> query, QueryData queryData)
    {
      return query.ApplyPageAndSortsThenSelectDynamic(queryData).ToListAsync();
    }

    public static List<object> GetPageDynamicSync<T>(this IQueryable<T> query, QueryData queryData)
    {
      return query.ApplyPageAndSortsThenSelectDynamic(queryData).ToList();
    }

    private static IQueryable<T> ApplyPageAndSorts<T>(this IQueryable<T> query, QueryData queryData)
    {
      int pageSize = queryData.PageSize;
      query = query.OrderBy(queryData.Sorts)
              .Skip((queryData.Page - 1) * pageSize).Take(pageSize);
      return query;
    }

    private static IQueryable<T> ApplyPageAndSortsThenSelect<T>(this IQueryable<T> query, QueryData queryData)
    {
      query = query.ApplyPageAndSorts(queryData);
      if (!string.IsNullOrEmpty(queryData.Fields))
        query = query.Select(CreateNewStatement<T>(queryData.Fields));
      return query;
    }

    private static IQueryable<object> ApplyPageAndSortsThenSelectDynamic<T>(this IQueryable<T> query, QueryData queryData)
    {
      return query.ApplyPageAndSorts(queryData).Select(CreateDynStatement<T>(queryData.Fields));
    }

    public static Expression<Func<T, T>> CreateNewStatement<T>(this string fields)
    {
      Type type = typeof(T);
      ParameterExpression xParameter = Expression.Parameter(type, "o");
      NewExpression xNew = Expression.New(type);
      string[] arrField = fields.Split(',').ToArray();
      int count = arrField.Length;
      MemberAssignment[] bindings = new MemberAssignment[count];
      int index = 0;
      for (int i = 0; i < count; i++)
      {
        PropertyInfo? mi = type.GetPropIgnoreCase(arrField[i].Trim());
        if (mi != null)
        {
          MemberExpression xOriginal = Expression.Property(xParameter, mi);
          bindings[index] = Expression.Bind(mi, xOriginal);
          index++;
        }
      }
      if (index != count)
      {
        count = index;
        MemberAssignment[] newBindings = new MemberAssignment[count];
        string[] newRealFields = new string[count];
        Array.Copy(bindings, newBindings, count);
        bindings = newBindings;
      }
      MemberInitExpression xInit = Expression.MemberInit(xNew, bindings);
      Expression<Func<T, T>> lambda = Expression.Lambda<Func<T, T>>(xInit, xParameter);
      return lambda;
    }

    public static (Expression<Func<T, object>> expressionFunc, Type newType) CreateDynStatementWithType<T>(string? fields, List<string> lstIgnoreField = null)
    {
      Type type = typeof(T);
      ParameterExpression thisParam = Expression.Parameter(type, "o");
      List<string> lstField;
      if (string.IsNullOrEmpty(fields))
      {
        PropertyInfo[] typeProps = type.GetProperties();
        lstField = typeProps.Select(q => q.Name.ToLower()).ToList();
      }
      else
      {
        lstField = fields.Split(',').Select(o => o.Trim().ToLower()).ToList();
      }

      int count;
      if (lstIgnoreField != null)
      {
        count = lstIgnoreField.Count;
        for (int i = 0; i < count; i++)
        {
          lstIgnoreField[i] = lstIgnoreField[i].ToLower();
        }
        lstField = lstField.Where(q => !lstIgnoreField.Contains(q)).ToList();
      }

      AssemblyName dynamicAssemblyName = new AssemblyName("TempAssembly");
      AssemblyBuilder dynamicAssembly = AssemblyBuilder.DefineDynamicAssembly(dynamicAssemblyName, AssemblyBuilderAccess.Run);
      ModuleBuilder dynamicModule = dynamicAssembly.DefineDynamicModule("TempAssembly");
      TypeBuilder dynamicAnonymousType = dynamicModule.DefineType("AnonymousType", TypeAttributes.Public);

      count = lstField.Count;
      MemberExpression[] props = new MemberExpression[count];
      string[] realFields = new string[count];
      int index = 0;
      for (int i = 0; i < count; i++)
      {
        PropertyInfo? mi = type.GetPropIgnoreCase(lstField[i]);
        if (mi != null)
        {
          props[index] = Expression.Property(thisParam, mi);
          realFields[index] = mi.Name.ToPrivateCase();
          FieldBuilder field = dynamicAnonymousType.DefineField(realFields[index], props[index].Type, FieldAttributes.Public);
          PropertyBuilder property = dynamicAnonymousType.DefineProperty(mi.Name, PropertyAttributes.HasDefault, props[index].Type, null);

          // Tạo getter
          MethodBuilder getMethod = dynamicAnonymousType.DefineMethod($"get_{mi.Name}",
              MethodAttributes.Public | MethodAttributes.SpecialName | MethodAttributes.HideBySig,
              props[index].Type, Type.EmptyTypes);

          ILGenerator il = getMethod.GetILGenerator();
          il.Emit(OpCodes.Ldarg_0);         // Load "this"
          il.Emit(OpCodes.Ldfld, field);    // Load field
          il.Emit(OpCodes.Ret);             // return field

          // Gán getter cho property
          property.SetGetMethod(getMethod);

          index++;
        }
      }

      if (index != count)
      {
        count = index;
        MemberExpression[] newProps = new MemberExpression[count];
        string[] newListRealField = new string[count];
        Array.Copy(props, newProps, count);
        Array.Copy(realFields, newListRealField, count);
        props = newProps;
        realFields = newListRealField;
      }

      Type anonType = dynamicAnonymousType.CreateType();
      MemberBinding[] mb = new MemberBinding[count];
      for (int i = 0; i < count; i++)
      {
        mb[i] = Expression.Bind(anonType.GetField(realFields[i]), props[i]);
      }

      MemberInitExpression xInit = Expression.MemberInit(Expression.New(anonType.GetConstructor(Type.EmptyTypes)), mb);

      Expression<Func<T, object>> lambda = Expression.Lambda<Func<T, object>>(xInit, thisParam);
      return (lambda, anonType);
    }

    private static string ToPrivateCase(this string value)
    {
      return string.Concat("_", char.ToLower(value[0]), value.Substring(1));
    }

    public static Expression<Func<T, object>> CreateDynStatement<T>(string? fields, List<string> lstIgnoreField = null)
    {
      return CreateDynStatementWithType<T>(fields, lstIgnoreField).expressionFunc;
    }

    public static PropertyInfo? GetPropIgnoreCase(this Type type, string field)
    {
      return type.GetProperty(field, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
    }

    public static void Clean(this List<Filter> lstFilter)
    {
      int count = lstFilter.Count;
      for (int index = 0; index < count; index++)
      {
        lstFilter[index] = lstFilter[index].Clean();
      }
    }

    public static Filter Clean(this Filter filter)
    {
      if (filter.Logic.HasValue && filter.Filters is { Count: > 0 })
      {
        List<Filter> lstFilter = new List<Filter>();
        int count = filter.Filters.Count;
        for (int i = 0; i < count; i++)
        {
          Filter tmpFilterChild = filter.Filters[i].Clean();
          if (tmpFilterChild.Logic == filter.Logic && tmpFilterChild.Filters is { Count: > 0 })
          {
            lstFilter.AddRange(tmpFilterChild.Filters);
          }
          else
          {
            lstFilter.Add(tmpFilterChild);
          }
        }

        if (lstFilter.Count == 1)
        {
          return lstFilter[0];
        }

        return new Filter(filter.Logic.Value, lstFilter);
      }
      else
      {
        return filter;
      }
    }
  }
}
