using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Options;
using Bidforge.Options;

namespace Bidforge.Services
{
    public class MkEMailSender
    {
        private readonly SmtpOptions _options;
        public MkEMailSender(IOptions<SmtpOptions> opts) => _options = opts.Value;

        public async Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default)
        {
            var msg = new MimeMessage();
            msg.From.Add(MailboxAddress.Parse(_options.From));
            msg.To.Add(MailboxAddress.Parse(to));
            msg.Subject = subject;
            msg.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

            using var client = new SmtpClient();

            var socketOptions =
                _options.UseStartTls ? SecureSocketOptions.StartTls :
                _options.UseSsl ? SecureSocketOptions.SslOnConnect :
                                       SecureSocketOptions.Auto;

            await client.ConnectAsync(_options.Host, _options.Port, socketOptions, ct);

            if (!string.IsNullOrWhiteSpace(_options.User))
                await client.AuthenticateAsync(_options.User, _options.Pass, ct);

            await client.SendAsync(msg, ct);
            await client.DisconnectAsync(true, ct);
        }
    }
}
