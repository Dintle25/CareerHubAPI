using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.CreateTable(
                name: "applicants",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    first_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_applicants", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "companies",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_companies", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "jobs",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    location = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    type = table.Column<int>(type: "integer", nullable: false),
                    salary_min = table.Column<decimal>(type: "numeric", nullable: true),
                    salary_max = table.Column<decimal>(type: "numeric", nullable: true),
                    closing_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    posted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_jobs", x => x.id);
                   
                    table.ForeignKey(
                        name: "fk_jobs_companies_company_id",
                        column: x => x.company_id,
                        principalSchema: "public",
                        principalTable: "companies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "applications",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    job_id = table.Column<Guid>(type: "uuid", nullable: false),
                    full_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    years_of_experience = table.Column<int>(type: "integer", nullable: false),
                    cover_letter = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    linked_in_url = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    available_immediately = table.Column<bool>(type: "boolean", nullable: false),
                    notice_period_weeks = table.Column<int>(type: "integer", nullable: false),
                    applied_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false),
                    applicant_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_applications", x => x.id);
                    table.ForeignKey(
                        name: "fk_applications_applicants_applicant_id",
                        column: x => x.applicant_id,
                        principalSchema: "public",
                        principalTable: "applicants",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_applications_jobs_job_id",
                        column: x => x.job_id,
                        principalSchema: "public",
                        principalTable: "jobs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_applicants_email",
                schema: "public",
                table: "applicants",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_applications_applicant_id",
                schema: "public",
                table: "applications",
                column: "applicant_id");

            migrationBuilder.CreateIndex(
                name: "ix_applications_job_id",
                schema: "public",
                table: "applications",
                column: "job_id");

            migrationBuilder.CreateIndex(
                name: "ix_companies_name",
                schema: "public",
                table: "companies",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_jobs_company_id",
                schema: "public",
                table: "jobs",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "ix_jobs_title_company_id",
                schema: "public",
                table: "jobs",
                columns: new[] { "title", "company_id" },
                unique: true);


            migrationBuilder.AddCheckConstraint(
                name: "CK_jobs_closing_after_posted",
                table: "jobs",
                sql: "closing_date > posted_at");

            migrationBuilder.AddCheckConstraint(
                name: "CK_jobs_salary_range",
                table: "jobs",
                sql: "salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min");  // ← snake_case
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "applications",
                schema: "public");

            migrationBuilder.DropTable(
                name: "applicants",
                schema: "public");

            migrationBuilder.DropTable(
                name: "jobs",
                schema: "public");

            migrationBuilder.DropTable(
                name: "companies",
                schema: "public");
        }
    }
}
