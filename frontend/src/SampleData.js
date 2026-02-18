export const users=[
  {
    "_id": "user_001",
    "username": "RavenX",
    "avatar": "https://api.dicebear.com/7.x/thumbs/png?seed=RavenX",
    "status": "online"
  },
  {
    "_id": "user_002",
    "username": "NightCoder",
    "avatar": "https://api.dicebear.com/7.x/thumbs/png?seed=NightCoder",
    "status": "idle"
  },
  {
    "_id": "user_003",
    "username": "ShadowByte",
    "avatar": "https://api.dicebear.com/7.x/thumbs/png?seed=ShadowByte",
    "status": "offline"
  },
  {
    "_id": "user_004",
    "username": "NeoFlux",
    "avatar": "https://api.dicebear.com/7.x/thumbs/png?seed=NeoFlux",
    "status": "online"
  },
  {
    "_id": "user_005",
    "username": "VoidWalker",
    "avatar": "https://api.dicebear.com/7.x/thumbs/png?seed=VoidWalker",
    "status": "dnd"
  },
  {
    "_id": "user_006",
    "username": "PixelGhost",
    "avatar": "https://api.dicebear.com/7.x/thumbs/png?seed=PixelGhost",
    "status": "online"
  },
  {
    "_id": "user_007",
    "username": "CyberCrow",
    "avatar": "https://api.dicebear.com/7.x/thumbs/png?seed=CyberCrow",
    "status": "idle"
  },
  {
    "_id": "user_008",
    "username": "DarkOrbit",
    "avatar": "https://api.dicebear.com/7.x/thumbs/png?seed=DarkOrbit",
    "status": "offline"
  },
  {
    "_id": "user_009",
    "username": "GlitchFox",
    "avatar": "https://api.dicebear.com/7.x/thumbs/png?seed=GlitchFox",
    "status": "online"
  },
  {
    "_id": "user_010",
    "username": "EchoNull",
    "avatar": "https://api.dicebear.com/7.x/thumbs/png?seed=EchoNull",
    "status": "dnd"
  }
]

export const chatMessages = [
  {
    "_id": "msg_001",
    "channelId": "dm_001",
    "senderId": "user_001",
    "content": "Hey! Are you online?",
    "createdAt": "2026-02-01T18:21:00Z"
  },
  {
    "_id": "msg_002",
    "channelId": "dm_001",
    "senderId": "user_002",
    "content": "Yeah 😎 just finished coding",
    "createdAt": "2026-02-01T18:21:45Z"
  },
  {
    "_id": "msg_003",
    "channelId": "dm_001",
    "senderId": "user_001",
    "content": "Nice! Want to test the DM system?",
    "createdAt": "2026-02-01T18:22:10Z"
  },
  {
    "_id": "msg_004",
    "channelId": "dm_001",
    "senderId": "user_002",
    "content": "Sure 🚀 send me a GIF",
    "createdAt": "2026-02-01T18:22:55Z"
  },
  {
    "_id": "msg_005",
    "channelId": "dm_001",
    "senderId": "user_001",
    "content": "😂😂 done",
    "createdAt": "2026-02-01T18:23:30Z"
  },

  {
    "_id": "msg_006",
    "channelId": "dm_002",
    "senderId": "user_003",
    "content": "Did you check the UI?",
    "createdAt": "2026-02-02T09:12:00Z"
  },
  {
    "_id": "msg_007",
    "channelId": "dm_002",
    "senderId": "user_001",
    "content": "Yes 🔥 looks clean",
    "createdAt": "2026-02-02T09:13:30Z"
  },

  {
    "_id": "msg_008",
    "channelId": "dm_003",
    "senderId": "user_004",
    "content": "Deploy tonight?",
    "createdAt": "2026-02-03T14:31:00Z"
  },
  {
    "_id": "msg_009",
    "channelId": "dm_003",
    "senderId": "user_001",
    "content": "Yes 🚀",
    "createdAt": "2026-02-03T14:32:10Z"
  }
];

export const dmChannel=[
  {
    "_id": "dm_001",
    "type": "DM",
    "participants": ["user_001", "user_002"],
    "createdAt": "2026-02-01T18:20:00Z",
    "lastMessageId": "msg_005"
  },
  {
    "_id": "dm_002",
    "type": "DM",
    "participants": ["user_001", "user_003"],
    "createdAt": "2026-02-02T09:10:00Z",
    "lastMessageId": "msg_010"
  },
  {
    "_id": "dm_003",
    "type": "DM",
    "participants": ["user_001", "user_004"],
    "createdAt": "2026-02-03T14:30:00Z",
    "lastMessageId": "msg_015"
  },
  {
    "_id": "dm_004",
    "type": "DM",
    "participants": ["user_001", "user_005"],
    "createdAt": "2026-02-04T11:00:00Z",
    "lastMessageId": "msg_020"
  },
  {
    "_id": "dm_005",
    "type": "DM",
    "participants": ["user_001", "user_006"],
    "createdAt": "2026-02-05T16:45:00Z",
    "lastMessageId": "msg_025"
  },
  {
    "_id": "dm_006",
    "type": "DM",
    "participants": ["user_001", "user_007"],
    "createdAt": "2026-02-06T08:20:00Z",
    "lastMessageId": "msg_030"
  },
  {
    "_id": "dm_007",
    "type": "DM",
    "participants": ["user_001", "user_008"],
    "createdAt": "2026-02-07T19:55:00Z",
    "lastMessageId": "msg_035"
  },
  {
    "_id": "dm_008",
    "type": "DM",
    "participants": ["user_001", "user_009"],
    "createdAt": "2026-02-08T13:05:00Z",
    "lastMessageId": "msg_040"
  },
  {
    "_id": "dm_009",
    "type": "DM",
    "participants": ["user_001", "user_010"],
    "createdAt": "2026-02-09T21:40:00Z",
    "lastMessageId": "msg_045"
  },
  {
    "_id": "dm_010",
    "type": "DM",
    "participants": ["user_002", "user_003"],
    "createdAt": "2026-02-10T10:15:00Z",
    "lastMessageId": "msg_050"
  }
]

export const friends=[
  {
    "_id": "65cfa101a1b2c3d4e5000001",
    "username": "rahul_k",
    "avatar":"https://i.pravatar.cc/150?img=1"
  },
  {
    "_id": "65cfa101a1b2c3d4e5000002",
    "username": "priya_s",
    "avatar": "https://i.pravatar.cc/150?img=2"
  },
  {
    "_id": "65cfa101a1b2c3d4e5000003",
    "username": "aman_dev",
    "avatar": "https://i.pravatar.cc/150?img=3"
  },
  {
    "_id": "65cfa101a1b2c3d4e5000004",
    "username": "neha_roy",
    "avatar": "https://i.pravatar.cc/150?img=4"
  },
  {
    "_id": "65cfa101a1b2c3d4e5000005",
    "username": "arjun_p",
    "avatar": "https://i.pravatar.cc/150?img=5"
  },
  {
    "_id": "65cfa101a1b2c3d4e5000006",
    "username": "kavya_m",
    "avatar": "https://i.pravatar.cc/150?img=6"
  },
  {
    "_id": "65cfa101a1b2c3d4e5000007",
    "username": "rohit_js",
    "avatar": "https://i.pravatar.cc/150?img=7"
  },
  {
    "_id": "65cfa101a1b2c3d4e5000008",
    "username": "simran_k",
    "avatar": "https://i.pravatar.cc/150?img=8"
  },
  {
    "_id": "65cfa101a1b2c3d4e5000009",
    "username": "vishal_b",
    "avatar": "https://i.pravatar.cc/150?img=9"
  },
  {
    "_id": "65cfa101a1b2c3d4e5000010",
    "username": "ananya_c",
    "avatar": "https://i.pravatar.cc/150?img=10"
  }
]

