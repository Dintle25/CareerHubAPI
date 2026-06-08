namespace API.Exceptions;

public class UnauthorizedListingUpdateException : Exception
{
    public UnauthorizedListingUpdateException()
        : base("Only the owning company can update this listing.")
    {
    }
}