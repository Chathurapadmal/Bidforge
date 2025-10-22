using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Bidforge.Services;

public class SmtpSettings
{
	public string Host { get; set; } = "smtp.gmail.com";
	public int Port { get; set; } = 587;
	public string User { get; set; } = "";
	public string Pass { get; set; } = "";
	public string FromEmail { get; set; } = "";
	public string FromName { get; set; } = "Bidforge";
	public bool UseStartTls { get; set; } = true;
}

public interface IEmailSender
{
	Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default);
}

public class EmailSender : IEmailSender
{
	private readonly SmtpSettings _cfg;
	public EmailSender(IOptions<SmtpSettings> cfg) => _cfg = cfg.Value;

	public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
	{
		var msg = new MimeMessage();
		msg.From.Add(new MailboxAddress(_cfg.FromName, _cfg.FromEmail));
		msg.To.Add(MailboxAddress.Parse(toEmail));
		msg.Subject = subject;

		var body = new BodyBuilder { HtmlBody = htmlBody };
		msg.Body = body.ToMessageBody();

		using var client = new SmtpClient();
		await client.ConnectAsync(_cfg.Host, _cfg.Port,
			_cfg.UseStartTls ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto, ct);

		if (!string.IsNullOrEmpty(_cfg.User))
			await client.AuthenticateAsync(_cfg.User, _cfg.Pass, ct);

		await client.SendAsync(msg, ct);
		await client.DisconnectAsync(true, ct);
	}
}
