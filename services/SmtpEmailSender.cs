using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace Bidforge.Services
{
    public class SmtpEmailSender : IEmailSender
    {
        private readonly IConfiguration _config;

        public SmtpEmailSender(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string to, string subject, string htmlBody)
        {
            var email = _config.GetSection("Email");
            var host = email["Host"];
            var port = int.Parse(email["Port"]);
            var username = email["UserName"];
            var password = email["Password"];
            var enableSsl = bool.Parse(email["EnableSSL"] ?? "true");

            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = enableSsl
            };

            var message = new MailMessage
            {
                From = new MailAddress(username, "Bidforge"),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            message.To.Add(to);

            await client.SendMailAsync(message);
        }
    }
}
