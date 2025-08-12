# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Copy solution file
COPY API.sln ./

# Copy project files
COPY Admin/API/*.csproj ./Admin/API/
COPY Admin/Application/*.csproj ./Admin/Application/
COPY Admin/Domain/*.csproj ./Admin/Domain/
COPY Admin/Infrastructure/*.csproj ./Admin/Infrastructure/
COPY Auth.DataAccess/*.csproj ./Auth.DataAccess/
COPY BffAuth/*.csproj ./BffAuth/
COPY IdentityServer4/*.csproj ./IdentityServer4/
COPY Shared/*.csproj ./Shared/

# Restore dependencies
RUN dotnet restore

# Copy source code
COPY . .

# Build the application
WORKDIR /src/Admin/API
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

# Copy published application
COPY --from=build /app/publish .

# Expose port
EXPOSE 80
EXPOSE 443

ENTRYPOINT ["dotnet", "API.dll"]