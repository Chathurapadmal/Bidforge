using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Bidforge.Services
{
    public interface IEmailSender
    {
        Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default);
    }

    public sealed class EmailSender : IEmailSender
    {
        private readonly IConfiguration _cfg;
        private readonly ILogger<EmailSender> _log;

        public EmailSender(IConfiguration cfg, ILogger<EmailSender> log)
        {
            _cfg = cfg;
            _log = log;
        }

        public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
        {
            // READ FROM "Smtp" (your config)
            var host = _cfg["Smtp:Host"] ?? "smtp.gmail.com";
            var port = int.TryParse(_cfg["Smtp:Port"], out var p) ? p : 587;
            var user = _cfg["Smtp:User"];                       // MUST be the Gmail account
            var pass = (_cfg["Smtp:Pass"] ?? "").Replace(" ", ""); // remove spaces just in case
            var fromEmail = _cfg["Smtp:FromEmail"] ?? user;     // From must match Gmail or allowed alias
            var fromName = _cfg["Smtp:FromName"] ?? "Bidforge";
            var useStartTls = bool.TryParse(_cfg["Smtp:UseStartTls"], out var tls) ? tls : true;

            if (string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(pass))
                throw new InvalidOperationException("Smtp:User and Smtp:Pass must be set (use a Gmail App Password).");

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

            using var smtp = new SmtpClient();

            var secure = useStartTls ? SecureSocketOptions.StartTls : SecureSocketOptions.SslOnConnect;
            await smtp.ConnectAsync(host, port, secure, ct);

            // IMPORTANT: authenticate before sending
            await smtp.AuthenticateAsync(user, pass, ct);

            await smtp.SendAsync(message, ct);
            await smtp.DisconnectAsync(true, ct);

            _log.LogInformation("Email sent to {To}", toEmail);
        }
    }
}
