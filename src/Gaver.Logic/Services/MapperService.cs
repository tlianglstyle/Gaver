using System.Collections.Generic;
using System.Linq;
using AutoMapper;

namespace Gaver.Logic
{
    public class MapperService : IMapperService
    {
        private readonly IMapper mapper;
        public MapperService(IEnumerable<Profile> profiles)
        {
            var mapperConfig = new MapperConfiguration(config =>
            {
                config.CreateMissingTypeMaps = true;
                config.CreateMap<Mail, SendGridMail>()
                    .MapMember(m => m.From, m => new SendGridAddress
                    {
                        Email = m.From,
                        Name = "Gaver"
                    })
                    .MapMember(m => m.Content, m => new[] {
                        new SendGridContent {
                            Value = m.Content,
                            Type = "text/html"
                        }
                    })
                    .MapMember(m => m.Personalizations, m => new[] {
                        new SendGridPersonalization {
                            To = m.To.Select(to => new SendGridAddress {
                                Email = to
                            }).ToList()
                        }
                    });
                foreach (var profile in profiles)
                {
                    config.AddProfile(profile);
                }
            });
            mapper = mapperConfig.CreateMapper();
        }

        public TTo Map<TFrom, TTo>(TFrom source)
        {
            return mapper.Map<TFrom, TTo>(source);
        }

        public void ValidateMappings() => mapper.ConfigurationProvider.AssertConfigurationIsValid();
    }
}