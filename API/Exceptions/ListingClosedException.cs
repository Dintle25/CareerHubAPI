namespace API.Exceptions;

public class ListingClosedException : Exception
{
    public ListingClosedException()
        : base("This job listing is closed.")
    {
    }

    public ListingClosedException(string message)
        : base(message)
    {
    }
}