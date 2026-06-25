import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { JobListing } from "@/types";

interface JobStatusBadgeProps {
  employmentType: JobListing["type"];
  isActive: boolean;
}

// mapping employmentType to badge colours(not hardcoded for the four values)
const employmentTypeColors: Record<JobListing["type"], string> = {
  FullTime: "bg-green-500 text-white hover:bg-green-600",
  PartTime: "bg-blue-500 text-white hover:bg-blue-600",
  Contract: "bg-purple-500 text-white hover:bg-purple-600",
  Internship: "bg-yellow-400 text-black hover:bg-yellow-500",
};

const JobStatusBadge = ({
  employmentType,
  isActive,
}: JobStatusBadgeProps) => {
  return (
    <div className="flex gap-2">
      <Badge
        className={cn(employmentTypeColors[employmentType])}
      >
        {employmentType}
      </Badge>

      {!isActive && (
        <Badge variant="destructive">
          Closed
        </Badge>
      )}
    </div>
  );
};

export default JobStatusBadge;