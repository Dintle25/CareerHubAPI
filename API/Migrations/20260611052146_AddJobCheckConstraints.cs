using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddJobCheckConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "CK_jobs_closing_after_posted",
                table: "jobs",
                sql: "\"ClosingDate\" > \"PostedAt\"");

            migrationBuilder.AddCheckConstraint(
                name: "CK_jobs_salary_range",
                table: "jobs",
                sql: "\"SalaryMin\" IS NULL OR \"SalaryMax\" IS NULL OR \"SalaryMax\" >= \"SalaryMin\"");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_jobs_closing_after_posted",
                table: "jobs");

            migrationBuilder.DropCheckConstraint(
                name: "CK_jobs_salary_range",
                table: "jobs");
        }
    }
}
