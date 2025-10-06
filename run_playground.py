#!/usr/bin/env python3
"""
Simple script to connect Friday agent to LiveKit playground
"""
import os
import sys
import asyncio
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from livekit import agents
from agent import Assistant

load_dotenv()

# Get LiveKit credentials from .env
LIVEKIT_URL = os.getenv("LIVEKIT_URL")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")

async def main():
    """Connect agent to a specific room for playground testing"""
    
    # Room name for testing (matches your current playground connection)
    room_name = "playground-2XNh-f65f"
    
    print(f"🤖 Starting Friday Agent...")
    print(f"🏠 Connecting to room: {room_name}")
    print(f"🌐 LiveKit URL: {LIVEKIT_URL}")
    
    # Create the agent with error handling
    try:
        assistant = Assistant()
    except ImportError as e:
        # Handle missing API keys by creating a simple agent that just connects
        print(f"⚠️ Warning: {e}")
        print("🔄 Continuing with minimal agent for playground connectivity only")
        
        # Create a minimal agent without LLM
        from livekit.agents import Agent
        # Provide the required instructions parameter
        assistant = Agent(
            instructions="You are Friday, a simple assistant for testing connectivity."
        )
    
    # Create explicit room options with credentials
    room_options = agents.RoomOptions(
        url=LIVEKIT_URL,
        api_key=LIVEKIT_API_KEY,
        api_secret=LIVEKIT_API_SECRET,
        name=room_name,
        identity="friday-assistant"
    )
    
    # Connect directly to the playground
    print("🔌 Connecting to LiveKit playground...")
    
    # Define the entrypoint with explicit room options
    async def entrypoint(ctx: agents.JobContext):
        # Connect to room using explicit credentials
        await ctx.connect()
        
        # Log connection details
        print(f"✅ Connected to room: {ctx.room.name}")
        print(f"👥 Participants: {len(ctx.room.remote_participants)}")
        
        # Try to enable noise cancellation if available
        try:
            from livekit.plugins import noise_cancellation
            room_input_options = agents.RoomInputOptions(
                video_enabled=True,
                noise_cancellation=noise_cancellation.BVC()
            )
        except ImportError:
            room_input_options = agents.RoomInputOptions(video_enabled=True)
        
        # Start the agent session
        try:
            session = agents.AgentSession()
            await session.start(
                room=ctx.room,
                agent=assistant,
                room_input_options=room_input_options,
            )
            
            # Generate initial greeting
            await session.generate_reply(
                instructions="Say hello and introduce yourself as Friday, the personal assistant."
            )
        except Exception as e:
            print(f"⚠️ Warning: Could not start full agent session: {e}")
            print("✅ But you are still connected to the room")
        
        print("\n🎙️ Friday assistant is active in the room")
        print("🔗 To join the room, go to: https://playground.livekit.io/#/join")
        print(f"   Room: {room_name}")
        print("   Give the LiveKit playground a moment to load")
        print("   Click 'Join Room' and start talking")
        print("\n⚠️  Press Ctrl+C to exit")
    
    # Run the worker with room options
    worker = agents.Worker(entrypoint_fnc=entrypoint, room_options=room_options)
    await worker.start()

if __name__ == "__main__":
    # Check for credentials
    if not all([LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET]):
        print("❌ Missing LiveKit credentials in .env file")
        exit(1)
        
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Friday agent stopped")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n🔧 Troubleshooting:")
        print("  1. Verify your LiveKit credentials in .env are correct")
        print("  2. Check your internet connection")
        print("  3. Try joining this specific room manually at: https://playground.livekit.io/#/join")
        print(f"     Room name: playground-2XNh-f65f")
        print("  4. If you're already in the playground (as your screenshot shows), try:")
        print("     - Disconnecting and reconnecting from the playground interface")
        print("     - Using the room name shown in your playground interface")