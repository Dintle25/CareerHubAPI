namespace API.Exceptions;

public class DuplicateApplicationException : Exception
{
    public DuplicateApplicationException()
        : base("An application for this listing has already been submitted by this applicant.")
    {
    }
}
