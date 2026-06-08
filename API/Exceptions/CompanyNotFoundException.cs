namespace API.Exceptions;

public class CompanyNotFoundException : Exception
{
    public CompanyNotFoundException(Guid companyId)
        : base($"Company with ID '{companyId}' was not found") { }
}


