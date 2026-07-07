using API.Models;

namespace API.Exceptions;

public class InvalidStatusTransitionException : Exception
{
    public ApplicationStatus Current { get; }
    public ApplicationStatus Attempted { get; }

    public InvalidStatusTransitionException(
        ApplicationStatus current,
        ApplicationStatus attempted)
        : base($"Cannot transition from '{current}' to '{attempted}'. " +
               $"'{current}' is a terminal state or the transition is not allowed.")
    {
        Current = current;
        Attempted = attempted;
    }
}