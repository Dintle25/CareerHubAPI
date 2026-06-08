namespace API.Exceptions;

public class ApplicationNotFoundException : Exception
{
    public ApplicationNotFoundException(Guid applicantId, Guid jobId)
        : base($"No application found for applicant '{applicantId}' and listing '{jobId}'.")
    {
    }
}
