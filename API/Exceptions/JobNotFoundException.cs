namespace API.Exceptions;

public class JobNotFoundException : Exception
{
    public JobNotFoundException(Guid id): base($"JOB with ID {id} was not found at all ")
    {
        
    }
}