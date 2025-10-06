#!/usr/bin/env python3
"""
Simplified script to connect to LiveKit playground
"""
import os
import asyncio
from dotenv import load_dotenv
import secrets
import string

# Load environment variables
load_dotenv()

# Import LiveKit modules
try:
    from livekit.rtc import Room, RoomOptions
    from livekit import rtc
except ImportError:
    print("❌ LiveKit RTC package not installed. Run: pip install livekit")
    exit(1)

# Get LiveKit credentials from environment variables
LIVEKIT_URL = os.getenv("LIVEKIT_URL")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")

# Room name from your screenshot
ROOM_NAME = "playground-2XNh-f65f"

# Generate a random participant identity
def generate_identity():
    alphabet = string.ascii_letters + string.digits
    return 'user-' + ''.join(secrets.choice(alphabet) for _ in range(8))

IDENTITY = generate_identity()

async def simple_connect():
    """
    Simple function to connect to a LiveKit room using provided credentials
    """
    print(f"🔌 Connecting to LiveKit playground...")
    print(f"🏠 Room: {ROOM_NAME}")
    print(f"🌐 URL: {LIVEKIT_URL}")
    print(f"👤 Identity: {IDENTITY}")
    
    if not all([LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET]):
        print("❌ Missing LiveKit credentials in .env file")
        print("   Make sure LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET are set")
        return
    
    # Generate an access token for the room
    try:
        from livekit import AccessToken
        token = AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        token.with_identity(IDENTITY)
        token.with_name(IDENTITY)
        token.with_grants({
            "room": ROOM_NAME,
            "room_join": True,
            "room_publish": True,
            "room_subscribe": True,
            "can_publish": True,
            "can_subscribe": True
        })
        access_token = token.to_jwt()
        print("✅ Generated access token")
    except ImportError:
        # Fallback if the AccessToken class is not available
        print("⚠️ Using simplified token format")
        access_token = f"{LIVEKIT_API_KEY}:{LIVEKIT_API_SECRET}"
        
    # Create room options
    options = RoomOptions(
        url=LIVEKIT_URL,
        token=access_token,
        name=ROOM_NAME,
        identity=IDENTITY
    )
    
    room = Room(options)
    
    # Connect to the room
    try:
        # Set up connection event handler
        @room.on("connected")
        def on_connected():
            print(f"✅ Connected to room: {ROOM_NAME}")
            print(f"🔗 To join the room, go to: https://playground.livekit.io/#/join")
            print(f"   Room name: {ROOM_NAME}")
            
        # Set up disconnection event handler
        @room.on("disconnected")
        def on_disconnected():
            print("❌ Disconnected from room")
            
        # Set up participant connect handler
        @room.on("participant_connected")
        def on_participant_connected(participant):
            print(f"👤 Participant connected: {participant.identity}")
            
        # Connect to the room
        await room.connect()
        
        print("🎤 Listening for participants to join...")
        print("⚠️  Press Ctrl+C to exit")
        
        # Keep the connection open
        while True:
            await asyncio.sleep(1)
            
    except Exception as e:
        print(f"❌ Error connecting to LiveKit room: {e}")
    finally:
        # Close the connection when done
        if room:
            await room.disconnect()
            print("👋 Disconnected from LiveKit")

if __name__ == "__main__":
    try:
        asyncio.run(simple_connect())
    except KeyboardInterrupt:
        print("\n👋 Connection closed by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n🔧 Troubleshooting:")
        print("  1. Check your LiveKit credentials in .env")
        print("  2. Make sure the LiveKit URL is correct and accessible")
        print("  3. Check your internet connection")
        print("  4. Verify that your LiveKit project is active")