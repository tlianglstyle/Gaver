﻿using System;
using LightInject;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using Gaver.Data;

namespace Gaver.TestUtils
{
    public abstract class TestBase
    {
        protected readonly IServiceContainer Container;

        public TestBase()
        {
            Container = new ServiceContainer();
            Container.RegisterFallback((type, name) => true, request => Substitute.For(new[] { request.ServiceType }, null), new PerContainerLifetime());
        }
    }

    public abstract class TestBase<TSut> : TestBase where TSut : class
    {
        private readonly Lazy<TSut> _testSubject;
        protected TSut TestSubject => _testSubject.Value;

        public TestBase()
        {
            _testSubject = new Lazy<TSut>(() => Container.Create<TSut>());
        }
    }

    public abstract class DbTestBase<TSut> : TestBase<TSut> where TSut : class
    {
        public DbTestBase()
        {
            var options = new DbContextOptionsBuilder<GaverContext>()
                .UseInMemoryDatabase().Options;
            Container.RegisterInstance<DbContextOptions<GaverContext>>(options);
        }
    }
}