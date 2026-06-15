FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

# COPY . /source
COPY ["API/API.csproj", "API/"]
RUN dotnet restore "API/API.csproj"

WORKDIR /source/API

ARG TARGETARCH    
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet publish -a ${TARGETARCH/amd64/x64} --use-current-runtime --self-contained false -o /app
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
WORKDIR /app


COPY --from=build /app/publish .    
USER $APP_UID

EXPOSE 8080
ENTRYPOINT ["dotnet", "Careerhub-Api.dll"]