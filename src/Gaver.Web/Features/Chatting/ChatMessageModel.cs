﻿using System;

namespace Gaver.Web.Features.Chatting
{
    public class ChatMessageModel
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public DateTimeOffset Created { get; set; }
        public ChatUserModel User { get; set; }
    }
}