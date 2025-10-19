namespace Bidforge.Options
{
    public sealed class SmtpOptions
    {
        public string Host { get; set; } = "";
        public int Port { get; set; } = 587;

        // Use one of these: StartTls for 587, or Ssl for 465
        public bool UseStartTls { get; set; } = true;
        public bool UseSsl { get; set; } = false;

        public string User { get; set; } = "";
        public string Pass { get; set; } = "";     // <-- appsettings uses 'Pass'
        public string From { get; set; } = "";
        public string? FromName { get; set; }      // optional
    }
}
