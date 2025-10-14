using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bidforge.Migrations
{
    /// <inheritdoc />
    public partial class AddBidderToBids : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bidder",
                table: "Bids",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bidder",
                table: "Bids");
        }
    }
}
