namespace API.Exceptions;
 
public class UnauthorizedApplicantException : Exception
{
    public UnauthorizedApplicantException()
        : base("You can only withdraw your own application.")
    {
    }
 
    public UnauthorizedApplicantException(Guid requestingApplicantId, Guid owningApplicantId)
        : base($"Applicant '{requestingApplicantId}' is not authorised to withdraw " +
               $"the application belonging to applicant '{owningApplicantId}'.")
    {
    }
}