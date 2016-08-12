using System;
using System.Threading.Tasks;
using Flurl.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Gaver.Logic
{
    public class MailSender : IMailSender
    {
        private readonly MailOptions options;
        private readonly IMapperService mapper;
        private readonly ILogger<MailSender> logger;

        public MailSender(IOptions<MailOptions> options, IMapperService mapper, ILogger<MailSender> logger)
        {
            this.options = options.Value;
            this.mapper = mapper;
            this.logger = logger;
        }

        public async Task SendAsync(Mail mail)
        {
            var sendGridMail = mapper.Map<Mail, SendGridMail>(mail);
            try
            {
                var response = await options.SendGridUrl
                    .WithOAuthBearerToken(options.SendGridApiKey)
                    .PostJsonAsync(sendGridMail);
            }
            catch (Exception e)
            {
                logger.LogErrorAndThrow(EventIds.ShareListFailed, e, "Failed to share list");
            }
        }
    }
}