using System.Collections.Generic;
using AutoMapper;
using Gaver.Logic.Contracts;

namespace Gaver.Logic.Services
{
    public class MapperService : IMapperService
    {
        private readonly IMapper mapper;
        public IConfigurationProvider MapperConfiguration { get; }

        public MapperService(IEnumerable<Profile> profiles)
        {
            MapperConfiguration = new MapperConfiguration(config =>
            {
                config.CreateMissingTypeMaps = true;
                foreach (var profile in profiles)
                {
                    config.AddProfile(profile);
                }
            });
            mapper = MapperConfiguration.CreateMapper();
        }

        public TTo Map<TTo>(object source)
        {
            return mapper.Map<TTo>(source);
        }

        public void ValidateMappings() => mapper.ConfigurationProvider.AssertConfigurationIsValid();
    }
}