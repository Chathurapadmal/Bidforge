using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace Bidforge.Services
{
    public class SmtpEmailSender : IEmailSender
    {
        private readonly IConfiguration _config;
        public SmtpEmailSender(IConfiguration config) => _config = config;

        public async Task SendEmailAsync(string to, string subject, string htmlBody)
        {
            var e = _config.GetSection("Email");
            var host = e["Host"] ?? "smtp.gmail.com";
            var portStr = e["Port"];
            var enableSslStr = e["EnableSSL"];

            if (!int.TryParse(portStr, out var port)) port = 587;
            var enableSsl = !string.IsNullOrWhiteSpace(enableSslStr)
                ? bool.Parse(enableSslStr)
                : true;

            var username = e["UserName"];
            var password = e["Password"];

            if (string.IsNullOrWhiteSpace(username))
                throw new InvalidOperationException("Email:UserName is not configured.");

            using var client = new SmtpClient(host, port)
            {
                Credentials = string.IsNullOrWhiteSpace(password)
                    ? CredentialCache.DefaultNetworkCredentials
                    : new NetworkCredential(username, password),
                EnableSsl = enableSsl
            };

            var from = new MailAddress(username, "Bidforge");
            var msg = new MailMessage(from, new MailAddress(to))
            {
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };

            await client.SendMailAsync(msg);
        }
    }
}
