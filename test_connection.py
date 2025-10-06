#!/usr/bin/env python3
"""
Test script to check LiveKit connection and credentials
"""
import os
import asyncio
from dotenv import load_dotenv
from livekit import api

load_dotenv()

async def test_livekit_connection():
    """Test if LiveKit credentials are working"""
    
    livekit_url = os.getenv("LIVEKIT_URL")
    livekit_api_key = os.getenv("LIVEKIT_API_KEY") 
    livekit_secret = os.getenv("LIVEKIT_API_SECRET")
    
    print("🔍 Testing LiveKit Connection...")
    print(f"URL: {livekit_url}")
    print(f"API Key: {livekit_api_key[:10]}..." if livekit_api_key else "API Key: Not set")
    print(f"Secret: {livekit_secret[:10]}..." if livekit_secret else "Secret: Not set")
    
    if not all([livekit_url, livekit_api_key, livekit_secret]):
        print("❌ Missing LiveKit credentials in .env file")
        print("\n📝 Please update your .env file with:")
        print("LIVEKIT_URL=wss://your-project.livekit.cloud")
        print("LIVEKIT_API_KEY=your-api-key")
        print("LIVEKIT_API_SECRET=your-secret")
        return False
        
    try:
        # Test connection by listing rooms
        livekit_api = api.LiveKitAPI(
            url=livekit_url,
            api_key=livekit_api_key,
            api_secret=livekit_secret,
        )
        
        rooms = await livekit_api.room.list_rooms(api.ListRoomsRequest())
        print(f"✅ Connection successful! Found {len(rooms)} rooms")
        
        # Create a test room for the agent
        test_room_name = "friday-test-room"
        try:
            room = await livekit_api.room.create_room(
                api.CreateRoomRequest(name=test_room_name)
            )
            print(f"✅ Created test room: {test_room_name}")
        except Exception as e:
            if "already exists" in str(e):
                print(f"ℹ️  Room {test_room_name} already exists")
            else:
                print(f"⚠️  Could not create room: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Check your LiveKit credentials at https://cloud.livekit.io")
        print("2. Make sure your project is active")
        print("3. Verify your internet connection")
        return False

if __name__ == "__main__":
    asyncio.run(test_livekit_connection())