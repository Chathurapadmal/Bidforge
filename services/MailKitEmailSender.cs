using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Options;

namespace Bidforge.Services;

public sealed class MailKitEmailSender : IEmailSender
{
    private readonly SmtpOptions _opt;
    private readonly ILogger<MailKitEmailSender> _log;

    public MailKitEmailSender(IOptions<SmtpOptions> opt, ILogger<MailKitEmailSender> log)
    {
        _opt = opt.Value;
        _log = log;
    }

    public async Task SendEmailAsync(string to, string subject, string htmlBody, CancellationToken ct = default)
    {
        var msg = new MimeMessage();
        msg.From.Add(new MailboxAddress(_opt.FromName ?? _opt.From, _opt.From));
        msg.To.Add(MailboxAddress.Parse(to));
        msg.Subject = subject;
        msg.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var client = new SmtpClient();

        // Pick the right TLS mode
        var secure = _opt.Port switch
        {
            465 => SecureSocketOptions.SslOnConnect,       // implicit SSL
            587 => SecureSocketOptions.StartTls,           // STARTTLS
            _ => _opt.UseSsl ? SecureSocketOptions.StartTlsWhenAvailable : SecureSocketOptions.None
        };

        try
        {
            await client.ConnectAsync(_opt.Host, _opt.Port, secure, ct);
            await client.AuthenticateAsync(_opt.User, _opt.Password, ct);
            await client.SendAsync(msg, ct);
            await client.DisconnectAsync(true, ct);

            _log.LogInformation("✅ Email sent to {Email}", to);
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "❌ Failed to send email to {Email}", to);
            throw;
        }
    }
}
