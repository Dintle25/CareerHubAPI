namespace API.Exceptions;

public class InvalidSalaryException : Exception
{
    public InvalidSalaryException()
        : base("SalaryMin cannot be greater than SalaryMax.")
    {
    }

    public InvalidSalaryException(string message)
        : base(message)
    {
    }
}