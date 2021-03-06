﻿using System.Linq;
using System.Security.Claims;
using Gaver.Logic.Constants;
using Gaver.Logic.Exceptions;

namespace Gaver.Web.Extensions
{
    public static class PrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal principal)
        {
            var idClaim = principal.Claims.SingleOrDefault(c => c.Type == "GaverUserId");
            int userId;
            if (!int.TryParse(idClaim?.Value, out userId)) {
                throw new FriendlyException(EventIds.UserNotRegistered, "Bruker-ID mangler. Vennligst last siden på nytt.");
            }
            return userId;
        }
    }
}