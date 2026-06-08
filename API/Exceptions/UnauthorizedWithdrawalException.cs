namespace API.Exceptions;

public class UnauthorizedWithdrawalException : Exception
{
    public UnauthorizedWithdrawalException()
        : base("An applicant may only withdraw their own application.")
    {
    }
}
